"use strict";

/* ==========================================
TASKFLIX — DASHBOARD MODULE
Task statistics, progress and upcoming tasks
========================================== */

/* Format a date and time for display. */
function formatDashboardDateTime(dateValue, timeValue) {
if (!dateValue) {
return "Date not set";
}

const normalizedTime = timeValue || "00:00";
const date = new Date(`${dateValue}T${normalizedTime}`);

if (Number.isNaN(date.getTime())) {
    return "Invalid date";
}

return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    ...(timeValue ? { timeStyle: "short" } : {})
}).format(date);

}

/* Determine whether a task is complete. */
function isDashboardTaskCompleted(task) {
return (
task.completed === true ||
task.is_completed === true ||
String(task.status || "").toLowerCase() === "completed" ||
String(task.status || "").toLowerCase() === "complete"
);
}

/* Calculate task summary statistics. */
function calculateDashboardStats(tasks = []) {
const safeTasks = Array.isArray(tasks) ? tasks : [];
const total = safeTasks.length;

const completed = safeTasks.filter(
    isDashboardTaskCompleted
).length;

const pending = total - completed;

const completionRate = total > 0
    ? Math.round((completed / total) * 100)
    : 0;

// Use the user's local calendar date.
const now = new Date();
const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
].join("-");

const dueToday = safeTasks.filter((task) => (
    task.end_date === today &&
    !isDashboardTaskCompleted(task)
)).length;

return {
    total,
    completed,
    pending,
    completionRate,
    dueToday
};

}

/* Update a text element safely. */
function setDashboardText(elementId, value) {
const element = document.getElementById(elementId);

if (element) {
    element.textContent = String(value);
}

}

/* Render dashboard statistics. */
function renderDashboardStats(tasks = []) {
const stats = calculateDashboardStats(tasks);

setDashboardText("dashboard-total-tasks", stats.total);
setDashboardText("dashboard-completed-tasks", stats.completed);
setDashboardText("dashboard-pending-tasks", stats.pending);
setDashboardText("dashboard-due-today", stats.dueToday);

setDashboardText(
    "dashboard-progress-label",
    `${stats.completionRate}% complete`
);

const progressFill = document.getElementById(
    "dashboard-progress-fill"
);

if (progressFill) {
    progressFill.style.width = `${stats.completionRate}%`;
    progressFill.setAttribute(
        "aria-valuenow",
        String(stats.completionRate)
    );
}

return stats;

}

/* Render the next five pending tasks by end date/time. */
function renderUpcomingTasks(tasks = []) {
const list = document.getElementById("upcoming-task-list");

if (!list) {
    return;
}

list.replaceChildren();

const safeTasks = Array.isArray(tasks) ? tasks : [];

const upcomingTasks = safeTasks
    .filter((task) => !isDashboardTaskCompleted(task))
    .sort((first, second) => {
        const firstDate =
            `${first.end_date || ""} ${first.end_time || ""}`;

        const secondDate =
            `${second.end_date || ""} ${second.end_time || ""}`;

        return firstDate.localeCompare(secondDate);
    })
    .slice(0, 5);

if (upcomingTasks.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "dashboard-empty";
    emptyMessage.textContent = "No pending tasks to display.";

    list.appendChild(emptyMessage);
    return;
}

upcomingTasks.forEach((task) => {
    const item = document.createElement("article");
    item.className = "upcoming-task-item";

    const details = document.createElement("div");
    details.className = "upcoming-task-details";

    const title = document.createElement("h4");
    title.className = "upcoming-task-title";
    title.textContent = task.description || "Untitled task";

    const time = document.createElement("p");
    time.className = "upcoming-task-time";
    time.textContent = formatDashboardDateTime(
        task.end_date,
        task.end_time
    );

    const status = document.createElement("span");
    status.className = "upcoming-task-status";
    status.textContent = "Pending";

    details.append(title, time);
    item.append(details, status);
    list.appendChild(item);
});

}

/* Update the dashboard when the task list changes. */
document.addEventListener("DOMContentLoaded", () => {
window.addEventListener("taskflix:tasks-updated", (event) => {
const tasks = event.detail?.tasks;

    if (!Array.isArray(tasks)) {
        return;
    }

    renderDashboardStats(tasks);
    renderUpcomingTasks(tasks);
});

});
