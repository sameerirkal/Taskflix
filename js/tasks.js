"use strict";

/* ==========================================
   TASKFLIX — CLOUD TASK MANAGEMENT
   Reliable loading, rendering and task actions
   ========================================== */

let taskflixTasks = [];
let editingTaskId = null;
let taskflixTasksLoading = false;
let taskflixLoadRequestId = 0;
let taskflixCurrentUserId = null;

/* ==========================================
OVERDUE TASK CONFIRMATION
========================================== */

let taskflixOverduePromptOpen = false;
let taskflixOverduePromptedIds = new Set();

async function checkTaskflixOverdueTasks() {
if (taskflixOverduePromptOpen || taskflixTasksLoading) {
return;
}

const now = new Date();

const overdueTask = taskflixTasks.find((task) => {
    if (task.completed) return false;
    if (!task.id) return false;
    if (taskflixOverduePromptedIds.has(task.id)) return false;

    const endDateTime = createTaskLocalDate(
        task.end_date,
        task.end_time
    );

    return endDateTime && endDateTime.getTime() <= now.getTime();
});

if (!overdueTask) return;

taskflixOverduePromptOpen = true;
taskflixOverduePromptedIds.add(overdueTask.id);

try {
    const completed = window.confirm(
        `Task: "${overdueTask.description}"\n\n` +
        "Its scheduled end time has passed.\n\n" +
        "Did you complete this task?\n\n" +
        "Press OK for Completed, or Cancel to keep it Pending."
    );

    if (completed) {
        await toggleTaskCompletion(overdueTask.id);
    }
} finally {
    taskflixOverduePromptOpen = false;

    window.setTimeout(() => {
        checkTaskflixOverdueTasks();
    }, 300);
}

}

function syncTaskflixTasksGlobal() {
    window.taskflixTasks = taskflixTasks;
}

syncTaskflixTasksGlobal();

/* ==========================================
   DATE AND TIME NORMALIZATION
   ========================================== */

/*
   Parse YYYY-MM-DD or DD-MM-YYYY into YYYY-MM-DD.
   No UTC conversion is used.
*/

function normalizeTaskDate(value) {
    const text = String(value ?? "").trim();

    if (!text) return "";

    let year;
    let month;
    let day;

    let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (match) {
        year = Number(match[1]);
        month = Number(match[2]);
        day = Number(match[3]);
    } else {
        match = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

        if (!match) return "";

        day = Number(match[1]);
        month = Number(match[2]);
        year = Number(match[3]);
    }

    const check = new Date(year, month - 1, day);

    if (
        check.getFullYear() !== year ||
        check.getMonth() !== month - 1 ||
        check.getDate() !== day
    ) {
        return "";
    }

    return [
        String(year).padStart(4, "0"),
        String(month).padStart(2, "0"),
        String(day).padStart(2, "0")
    ].join("-");
}

/*
   Normalize HH:MM, HH:MM AM/PM, or database TIME.
   Output is always 24-hour HH:MM.
*/

function normalizeTaskTime(value) {
    const text = String(value ?? "").trim();

    if (!text) return "";

    const match = text.match(
        /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i
    );

    if (!match) return "";

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3]?.toUpperCase();

    if (minutes > 59) return "";

    if (meridiem) {
        if (hours < 1 || hours > 12) return "";

        if (meridiem === "AM") {
            hours = hours === 12 ? 0 : hours;
        } else {
            hours = hours === 12 ? 12 : hours + 12;
        }
    } else if (hours > 23) {
        return "";
    }

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0")
    ].join(":");
}

/*
   Build a local timestamp from normalized date and time.
   This avoids parsing a date-only ISO string as UTC.
*/

function createTaskLocalDate(dateValue, timeValue) {
    const date = normalizeTaskDate(dateValue);
    const time = normalizeTaskTime(timeValue);

    if (!date || !time) return null;

    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    const result = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
        0,
        0
    );

    if (Number.isNaN(result.getTime())) {
        return null;
    }

    return result;
}

/* ==========================================
   VALIDATION
   ========================================== */

function validateTaskInput(task) {
    const description = String(task.description ?? "").trim();

    if (!description) {
        return "Please enter a task description.";
    }

    if (description.length > 500) {
        return "Description cannot exceed 500 characters.";
    }

    const startDate = normalizeTaskDate(task.start_date);
    const startTime = normalizeTaskTime(task.start_time);
    const endDate = normalizeTaskDate(task.end_date);
    const endTime = normalizeTaskTime(task.end_time);

    if (!startDate || !startTime || !endDate || !endTime) {
        return (
            "Please enter valid dates and times. " +
            "Use dates like 15-10-2026 and times like 09:30 AM."
        );
    }

    const start = createTaskLocalDate(startDate, startTime);
    const end = createTaskLocalDate(endDate, endTime);

    if (!start || !end) {
        return "Please select valid dates and times.";
    }

    if (end.getTime() <= start.getTime()) {
        return "End date and time must be after the start date and time.";
    }

    return null;
}

/* ==========================================
   MESSAGES AND DATE FORMATTING
   ========================================== */

function showTaskMessage(message, type = "info") {
    const element = document.getElementById("task-message");

    if (!element) return;

    element.textContent = message;
    element.className = "status-message";

    if (["success", "warning", "error"].includes(type)) {
        element.classList.add(`status-${type}`);
    }
}

function formatTaskDateTime(dateValue, timeValue) {
    const date = normalizeTaskDate(dateValue);
    const time = normalizeTaskTime(timeValue);

    if (!date || !time) {
        return "Date/time not available";
    }

    const parsedDate = createTaskLocalDate(date, time);

    if (!parsedDate) {
        return "Invalid date";
    }

    const formattedDate = new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(parsedDate);

    const formattedTime = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    }).format(parsedDate);

    return `${formattedDate}, ${formattedTime}`;
}

/* ==========================================
   TASK UPDATE EVENTS
   ========================================== */

function notifyTasksUpdated() {
    syncTaskflixTasksGlobal();

    window.dispatchEvent(
        new CustomEvent("taskflix:tasks-updated", {
            detail: {
                tasks: taskflixTasks.map((task) => ({ ...task }))
            }
        })
    );
}

/* ==========================================
   TASK ELEMENT CREATION
   ========================================== */

function createTaskElement(task) {
    const item = document.createElement("article");
    item.className = "task-item";

    if (task.completed) {
        item.classList.add("is-completed");
    }

    const main = document.createElement("div");
    main.className = "task-item-main";

    const title = document.createElement("h4");
    title.className = "task-item-title";
    title.textContent = task.description || "Untitled task";

    const meta = document.createElement("div");
    meta.className = "task-item-meta";

    const start = document.createElement("span");
    start.textContent =
        `Start: ${formatTaskDateTime(task.start_date, task.start_time)}`;

    const end = document.createElement("span");
    end.textContent =
        `End: ${formatTaskDateTime(task.end_date, task.end_time)}`;

    meta.append(start, end);

    const status = document.createElement("span");
    status.className = "task-item-status";

    if (task.completed) {
        status.classList.add("is-completed");
        status.textContent = "Completed";
    } else {
        status.classList.add("is-pending");
        status.textContent = "Pending";
    }

    const actions = document.createElement("div");
    actions.className = "task-item-actions";

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.textContent =
        task.completed ? "Mark Pending" : "Complete";

    completeButton.addEventListener("click", () => {
        toggleTaskCompletion(task.id);
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "button-secondary";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
        editTask(task.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "task-delete-button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
    });

    actions.append(completeButton, editButton, deleteButton);
    main.append(title, meta);
    item.append(main, status, actions);

    return item;
}

/* ==========================================
   RENDER TASK LIST
   ========================================== */

function renderTaskList() {
    syncTaskflixTasksGlobal();

    const list = document.getElementById("task-list");

    if (!list) return;

    list.replaceChildren();

    if (taskflixTasksLoading) {
        const loading = document.createElement("p");
        loading.className = "task-loading-state";
        loading.setAttribute("role", "status");
        loading.textContent = "Loading your tasks...";
        list.appendChild(loading);
        return;
    }

    if (taskflixTasks.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "task-empty-state";
        emptyMessage.textContent =
            "No tasks yet. Add your first task to get started.";

        list.appendChild(emptyMessage);
        notifyTasksUpdated();
        return;
    }

    taskflixTasks.forEach((task) => {
        list.appendChild(createTaskElement(task));
    });

    notifyTasksUpdated();
}

/* ==========================================
   LOAD TASKS FROM CLOUD
   ========================================== */

async function loadCloudTasks() {
    const requestId = ++taskflixLoadRequestId;

    taskflixTasksLoading = true;
    renderTaskList();

    try {
        const tasks = await loadTaskflixCloudTasks();

        if (requestId !== taskflixLoadRequestId) {
            return false;
        }

        taskflixTasks = tasks.map((task) => ({
            ...task,
            completed: Boolean(task.completed)
        }));

        syncTaskflixTasksGlobal();

        showTaskMessage("Your cloud tasks are up to date.", "success");

        return true;
    } catch (error) {
        if (requestId !== taskflixLoadRequestId) {
            return false;
        }

        taskflixTasks = [];
        syncTaskflixTasksGlobal();

        showTaskMessage(
            error.message || "Could not load tasks from cloud storage.",
            "error"
        );

        return false;
    } finally {
        if (requestId === taskflixLoadRequestId) {
            taskflixTasksLoading = false;
            renderTaskList();
        }
    }
}

/* ==========================================
   COMPLETE OR REOPEN A TASK
   ========================================== */

async function toggleTaskCompletion(taskId) {
    const task = taskflixTasks.find((item) => item.id === taskId);

    if (!task) return;

    const previousValue = task.completed;
    const newValue = !previousValue;

    task.completed = newValue;
    syncTaskflixTasksGlobal();
    renderTaskList();

    try {
        await setTaskflixCloudTaskCompletion(taskId, newValue);

        showTaskMessage(
            newValue
                ? "Task marked as completed."
                : "Task marked as pending.",
            "success"
        );

        notifyTasksUpdated();
    } catch (error) {
        task.completed = previousValue;
        syncTaskflixTasksGlobal();
        renderTaskList();

        showTaskMessage(
            error.message || "Could not update task status.",
            "error"
        );
    }
}

/* ==========================================
   EDIT TASK
   ========================================== */

function editTask(taskId) {
    const task = taskflixTasks.find((item) => item.id === taskId);

    if (!task) return;

    document.getElementById("task-description").value = task.description;

    document.getElementById("start-date").value =
        normalizeTaskDate(task.start_date);

    document.getElementById("start-time").value =
        normalizeTaskTime(task.start_time);

    document.getElementById("end-date").value =
        normalizeTaskDate(task.end_date);

    document.getElementById("end-time").value =
        normalizeTaskTime(task.end_time);

    editingTaskId = taskId;

    const saveButton = document.getElementById("save-task-button");

    if (saveButton) {
        saveButton.textContent = "Update Task";
    }

    document.getElementById("task-description").focus();
}

/* ==========================================
   DELETE TASK
   ========================================== */

async function deleteTask(taskId) {
    const task = taskflixTasks.find((item) => item.id === taskId);

    if (!task) return;

    if (!window.confirm(`Delete the task "${task.description}"?`)) {
        return;
    }

    try {
        await deleteTaskflixCloudTask(taskId);

        taskflixTasks = taskflixTasks.filter(
            (item) => item.id !== taskId
        );

        syncTaskflixTasksGlobal();

        if (editingTaskId === taskId) {
            resetTaskForm();
        }

        renderTaskList();
        notifyTasksUpdated();

        showTaskMessage("Task deleted.", "success");
    } catch (error) {
        showTaskMessage(
            error.message || "Could not delete the task.",
            "error"
        );
    }
}

/* ==========================================
   RESET TASK FORM
   ========================================== */

function resetTaskForm() {
    const form = document.getElementById("task-form");

    if (form) {
        form.reset();
    }

    editingTaskId = null;

    const saveButton = document.getElementById("save-task-button");

    if (saveButton) {
        saveButton.textContent = "Save Task";
    }
}

/* ==========================================
   CREATE OR UPDATE TASK
   ========================================== */

async function saveTask(taskValues) {
    const validationMessage = validateTaskInput(taskValues);

    if (validationMessage) {
        showTaskMessage(validationMessage, "error");
        return;
    }

    const normalizedTask = {
        description: String(taskValues.description).trim(),
        start_date: normalizeTaskDate(taskValues.start_date),
        start_time: normalizeTaskTime(taskValues.start_time),
        end_date: normalizeTaskDate(taskValues.end_date),
        end_time: normalizeTaskTime(taskValues.end_time)
    };

    const saveButton = document.getElementById("save-task-button");

    if (saveButton) {
        saveButton.disabled = true;
    }

    try {
        let savedTask;

        if (editingTaskId) {
            savedTask = await updateTaskflixCloudTask(
                editingTaskId,
                normalizedTask
            );

            taskflixTasks = taskflixTasks.map((task) =>
                task.id === editingTaskId
                    ? {
                        ...task,
                        ...savedTask,
                        completed: Boolean(savedTask.completed)
                    }
                    : task
            );

            showTaskMessage("Task updated in cloud storage.", "success");
        } else {
            savedTask = await createTaskflixCloudTask(normalizedTask);

            taskflixTasks.push({
                ...savedTask,
                completed: Boolean(savedTask.completed)
            });

            showTaskMessage("Task saved.", "success");
        }

        syncTaskflixTasksGlobal();
        resetTaskForm();
        renderTaskList();
        notifyTasksUpdated();
    } catch (error) {
        showTaskMessage(
            error.message || "Could not save the task.",
            "error"
        );
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}

/* ==========================================
   HANDLE AUTH STATE
   ========================================== */

function handleTaskflixAuthState(event) {
    const user = event.detail?.user ?? null;
    const nextUserId = user?.id ?? null;

    if (!nextUserId) {
        taskflixLoadRequestId++;
        taskflixCurrentUserId = null;
        taskflixTasks = [];
        taskflixTasksLoading = false;

        syncTaskflixTasksGlobal();
        resetTaskForm();
        renderTaskList();
        return;
    }

    if (
        taskflixCurrentUserId === nextUserId &&
        taskflixTasksLoading
    ) {
        return;
    }

    taskflixCurrentUserId = nextUserId;
    loadCloudTasks();
}

/* ==========================================
   INITIALIZATION
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("task-form");

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const taskValues = {
                description:
                    document.getElementById("task-description")?.value ?? "",
                start_date:
                    document.getElementById("start-date")?.value ?? "",
                start_time:
                    document.getElementById("start-time")?.value ?? "",
                end_date:
                    document.getElementById("end-date")?.value ?? "",
                end_time:
                    document.getElementById("end-time")?.value ?? ""
            };

            await saveTask(taskValues);
        });
    }

    window.addEventListener(
        "taskflix:auth-state",
        handleTaskflixAuthState
    );

    renderTaskList();

    (async () => {
        try {
            const client = getTaskflixSupabaseClient();

            if (!client) return;

            const { data, error } = await client.auth.getSession();

            if (error) throw error;

            const user = data.session?.user ?? null;

            if (user) {
                handleTaskflixAuthState({
                    detail: {
                        user,
                        session: data.session
                    }
                });
            }
        } catch (error) {
            showTaskMessage(
                error.message || "Could not restore your task session.",
                "error"
            );
        }
    })();
});
