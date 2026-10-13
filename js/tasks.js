"use strict";

/* ==========================================
TASKFLIX — TASK MANAGEMENT MODULE
Task validation, rendering and interactions
========================================== */

/*

* This module currently manages tasks in memory.
* Persistent cloud storage will be integrated through
* Supabase in a later step.
  */

let taskflixTasks = [];
let editingTaskId = null;

/**

* Generate a unique identifier for a task.
  */
  function generateTaskId() {
  if (
  typeof crypto !== "undefined" &&
  typeof crypto.randomUUID === "function"
  ) {
  return crypto.randomUUID();
  }
  
  return "${Date.now()}-${Math.random().toString(36).slice(2)}";
  }

/**

* Validate the task form values.
  */
  function validateTaskInput(task) {
  if (!task.description || !task.description.trim()) {
  return "Please enter a task description.";
  }
  
  if (
  !task.start_date ||
  !task.start_time ||
  !task.end_date ||
  !task.end_time
  ) {
  return "Please enter the start and end date and time.";
  }
  
  const start = new Date("${task.start_date}T${task.start_time}");
  const end = new Date("${task.end_date}T${task.end_time}");
  
  if (
  Number.isNaN(start.getTime()) ||
  Number.isNaN(end.getTime())
  ) {
  return "Please enter valid dates and times.";
  }
  
  if (end <= start) {
  return "The end date and time must be after the start date and time.";
  }
  
  return null;
  }

/**

* Display a task-related message.
  */
  function showTaskMessage(message, type = "info") {
  const element = document.getElementById("task-message");
  
  if (!element) {
  return;
  }
  
  element.textContent = message;
  element.className = "status-message";
  
  if (["success", "warning", "error"].includes(type)) {
  element.classList.add("status-${type}");
  }
  }

/**

* Format a date and time for the task list.
  */
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

/**

* Notify other modules that the task collection changed.
  */
  function notifyTasksUpdated() {
  window.dispatchEvent(
  new CustomEvent("taskflix:tasks-updated", {
  detail: {
  tasks: taskflixTasks.map((task) => ({ ...task }))
  }
  })
  );
  }

/**

* Create a task card using safe DOM methods.
  */
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
  
  const startTime = document.createElement("span");
  startTime.textContent =
  "Start: ${formatTaskDateTime(task.start_date, task.start_time)}";
  
  const endTime = document.createElement("span");
  endTime.textContent =
  "End: ${formatTaskDateTime(task.end_date, task.end_time)}";
  
  meta.append(startTime, endTime);
  
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
  completeButton.textContent = task.completed
  ? "Mark Pending"
  : "Complete";
  
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

/**

* Render the complete task collection.
  */
  function renderTaskList() {
  const list =
  document.getElementById("task-list") ||
  document.getElementById("task-list-container");
  
  if (!list) {
  return;
  }
  
  list.replaceChildren();
  
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

/**

* Toggle a task's completion status.
  */
  function toggleTaskCompletion(taskId) {
  const task = taskflixTasks.find((item) => item.id === taskId);
  
  if (!task) {
  return;
  }
  
  task.completed = !task.completed;
  
  renderTaskList();
  
  showTaskMessage(
  task.completed
  ? "Task marked as completed."
  : "Task marked as pending.",
  "success"
  );
  }

/**

* Load a task into the form for editing.
  */
  function editTask(taskId) {
  const task = taskflixTasks.find((item) => item.id === taskId);
  
  if (!task) {
  return;
  }
  
  const description = document.getElementById("task-description");
  const startDate = document.getElementById("start-date");
  const startTime = document.getElementById("start-time");
  const endDate = document.getElementById("end-date");
  const endTime = document.getElementById("end-time");
  
  if (
  !description ||
  !startDate ||
  !startTime ||
  !endDate ||
  !endTime
  ) {
  return;
  }
  
  description.value = task.description;
  startDate.value = task.start_date;
  startTime.value = task.start_time;
  endDate.value = task.end_date;
  endTime.value = task.end_time;
  
  editingTaskId = taskId;
  
  const saveButton = document.getElementById("save-task-button");
  
  if (saveButton) {
  saveButton.textContent = "Update Task";
  }
  
  description.focus();
  }

/**

* Delete a task after user confirmation.
  */
  function deleteTask(taskId) {
  const task = taskflixTasks.find((item) => item.id === taskId);
  
  if (!task) {
  return;
  }
  
  const confirmed = window.confirm(
  "Delete the task "${task.description}"?"
  );
  
  if (!confirmed) {
  return;
  }
  
  taskflixTasks = taskflixTasks.filter(
  (item) => item.id !== taskId
  );
  
  if (editingTaskId === taskId) {
  resetTaskForm();
  }
  
  renderTaskList();
  showTaskMessage("Task deleted.", "success");
  }

/**

* Reset the task form after saving or cancelling an edit.
  */
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

/**

* Add a new task or update an existing one.
  */
  function saveTask(taskValues) {
  const validationMessage = validateTaskInput(taskValues);
  
  if (validationMessage) {
  showTaskMessage(validationMessage, "error");
  return false;
  }
  
  const normalizedTask = {
  description: taskValues.description.trim(),
  start_date: taskValues.start_date,
  start_time: taskValues.start_time,
  end_date: taskValues.end_date,
  end_time: taskValues.end_time
  };
  
  if (editingTaskId) {
  const existingTask = taskflixTasks.find(
  (task) => task.id === editingTaskId
  );
  
   if (!existingTask) {
     showTaskMessage(
         "The task could not be found. Please try again.",
         "error"
     );
     return false;
 }

 Object.assign(existingTask, normalizedTask);
 editingTaskId = null;

 showTaskMessage("Task updated.", "success");
  
  } else {
  taskflixTasks.push({
  id: generateTaskId(),
  ...normalizedTask,
  completed: false
  });
  
   showTaskMessage("Task added.", "success");
  
  }
  
  resetTaskForm();
  renderTaskList();
  
  return true;
  }

/**

* Connect the task form to this module.
  */
  document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("task-form");
  
  if (!form) {
  return;
  }
  
  form.addEventListener("submit", (event) => {
  event.preventDefault();
  
   const taskValues = {
     description:
         document.getElementById("task-description")?.value || "",
     start_date:
         document.getElementById("start-date")?.value || "",
     start_time:
         document.getElementById("start-time")?.value || "",
     end_date:
         document.getElementById("end-date")?.value || "",
     end_time:
         document.getElementById("end-time")?.value || ""
 };

 saveTask(taskValues);
  
  });
  
  renderTaskList();
  });
