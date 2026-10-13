"use strict";

/* ==========================================
TASKFLIX — CLOUD TASK MANAGEMENT
Add, edit, complete, load and delete tasks
========================================== */

let taskflixTasks = [];
let editingTaskId = null;
let taskflixTasksLoading = false;

function validateTaskInput(task) {
if (!task.description || !task.description.trim()) {
return "Please enter a task description.";
}

if (task.description.trim().length > 500) {
    return "Description cannot exceed 500 characters.";
}

if (
    !task.start_date ||
    !task.start_time ||
    !task.end_date ||
    !task.end_time
) {
    return "Please enter the start and end date and time.";
}

const start = new Date(`${task.start_date}T${task.start_time}`);
const end = new Date(`${task.end_date}T${task.end_time}`);

if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Please enter valid dates and times.";
}

if (end <= start) {
    return "The end date and time must be after the start date and time.";
}

return null;

}

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
const date = new Date("${dateValue}T${timeValue}");

if (Number.isNaN(date.getTime())) {
    return "Invalid date";
}

return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
}).format(date);

}

function notifyTasksUpdated() {
window.dispatchEvent(
new CustomEvent("taskflix:tasks-updated", {
detail: {
tasks: taskflixTasks.map((task) => ({ ...task }))
}
})
);
}

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
title.textContent = task.description;

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

function renderTaskList() {
const list = document.getElementById("task-list");

if (!list) return;

list.replaceChildren();

if (taskflixTasksLoading) {
    const loading = document.createElement("p");
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

async function loadCloudTasks() {
taskflixTasksLoading = true;
renderTaskList();

try {
    const tasks = await loadTaskflixCloudTasks();

    taskflixTasks = tasks.map((task) => ({
        ...task,
        completed: Boolean(task.completed)
    }));

    showTaskMessage("Your cloud tasks are up to date.", "success");
} catch (error) {
    taskflixTasks = [];

    showTaskMessage(
        error.message || "Could not load tasks from cloud storage.",
        "error"
    );
} finally {
    taskflixTasksLoading = false;
    renderTaskList();
}

}

async function toggleTaskCompletion(taskId) {
const task = taskflixTasks.find((item) => item.id === taskId);

if (!task) return;

const previousValue = task.completed;
const newValue = !previousValue;

task.completed = newValue;
renderTaskList();

try {
    await setTaskflixCloudTaskCompletion(taskId, newValue);

    showTaskMessage(
        newValue
            ? "Task marked as completed."
            : "Task marked as pending.",
        "success"
    );
} catch (error) {
    task.completed = previousValue;
    renderTaskList();

    showTaskMessage(
        error.message || "Could not update task status.",
        "error"
    );
}

}

function editTask(taskId) {
const task = taskflixTasks.find((item) => item.id === taskId);

if (!task) return;

document.getElementById("task-description").value = task.description;
document.getElementById("start-date").value = task.start_date;
document.getElementById("start-time").value = task.start_time;
document.getElementById("end-date").value = task.end_date;
document.getElementById("end-time").value = task.end_time;

editingTaskId = taskId;

const saveButton = document.getElementById("save-task-button");

if (saveButton) {
    saveButton.textContent = "Update Task";
}

document.getElementById("task-description").focus();

}

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

    if (editingTaskId === taskId) {
        resetTaskForm();
    }

    renderTaskList();
    showTaskMessage("Task deleted.", "success");
} catch (error) {
    showTaskMessage(
        error.message || "Could not delete the task.",
        "error"
    );
}

}

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

async function saveTask(taskValues) {
const validationMessage = validateTaskInput(taskValues);

if (validationMessage) {
    showTaskMessage(validationMessage, "error");
    return;
}

const normalizedTask = {
    description: taskValues.description.trim(),
    start_date: taskValues.start_date,
    start_time: taskValues.start_time,
    end_date: taskValues.end_date,
    end_time: taskValues.end_time
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
                ? { ...task, ...savedTask }
                : task
        );

        showTaskMessage("Task updated in cloud storage.", "success");
    } else {
        savedTask = await createTaskflixCloudTask(normalizedTask);
        taskflixTasks.push(savedTask);

        showTaskMessage("Task saved.", "success");
    }

    resetTaskForm();
    renderTaskList();
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

window.addEventListener("taskflix:auth-state", (event) => {
    if (event.detail?.user) {
        loadCloudTasks();
    } else {
        taskflixTasks = [];
        taskflixTasksLoading = false;
        resetTaskForm();
        renderTaskList();
    }
});

renderTaskList();

});
