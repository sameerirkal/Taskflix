"use strict";

/* ==========================================
TASKFLIX — NOTIFICATIONS MODULE
Browser notification foundation
========================================== */

const TASKFLIX_NOTIFICATION_DEFAULTS = {
reminderMinutesBefore: 10
};

let taskflixNotificationPermissionRequested = false;
const taskflixShownNotificationKeys = new Set();

/**

* Check whether this browser supports notifications.
  */
  function areTaskflixNotificationsSupported() {
  return (
  typeof window !== "undefined" &&
  "Notification" in window
  );
  }

/**

* Return the current browser notification permission.
  */
  function getTaskflixNotificationPermission() {
  if (!areTaskflixNotificationsSupported()) {
  return "unsupported";
  }
  
  return Notification.permission;
  }

/**

* Request permission only when explicitly initiated by the user.

* Call this from a button click or another user action.
  */
  async function requestTaskflixNotificationPermission() {
  if (!areTaskflixNotificationsSupported()) {
  return {
  granted: false,
  permission: "unsupported",
  message: "This browser does not support notifications."
  };
  }
  
  if (Notification.permission === "granted") {
  return {
  granted: true,
  permission: "granted",
  message: "Notifications are already enabled."
  };
  }
  
  if (Notification.permission === "denied") {
  return {
  granted: false,
  permission: "denied",
  message: "Notifications are blocked in browser settings."
  };
  }
  
  if (taskflixNotificationPermissionRequested) {
  return {
  granted: false,
  permission: Notification.permission,
  message: "A permission request has already been made in this session."
  };
  }
  
  taskflixNotificationPermissionRequested = true;
  
  try {
  const permission = await Notification.requestPermission();
  
   return {
     granted: permission === "granted",
     permission,
     message:
         permission === "granted"
             ? "Notification permission granted."
             : "Notification permission was not granted."
 };
  
  } catch (error) {
  return {
  granted: false,
  permission: Notification.permission,
  message: "Could not request notification permission."
  };
  }
  }

/**

* Display a browser notification when permission is granted.

* This does not provide background delivery when the browser is closed.
  */
  function showTaskflixBrowserNotification(title, body, notificationKey) {
  if (!areTaskflixNotificationsSupported()) {
  return false;
  }
  
  if (Notification.permission !== "granted") {
  return false;
  }
  
  if (
  notificationKey &&
  taskflixShownNotificationKeys.has(notificationKey)
  ) {
  return false;
  }
  
  try {
  const notification = new Notification(String(title || "TASKFLIX"), {
  body: String(body || ""),
  tag: notificationKey
  ? String(notificationKey)
  : "taskflix-notification"
  });
  
   if (notificationKey) {
     taskflixShownNotificationKeys.add(notificationKey);
 }

 notification.onclick = () => {
     window.focus();
     notification.close();
 };

 return true;
  
  } catch (error) {
  return false;
  }
  }

/**

* Prepare notification text for a task.

* Actual scheduled reminders will be connected later.
  */
  function buildTaskflixTaskReminder(task, reminderType = "start") {
  if (!task || !task.description) {
  return null;
  }
  
  if (reminderType === "end") {
  return {
  title: "TASKFLIX: Task deadline",
  body: "Your task "${task.description}" has reached its scheduled end time."
  };
  }
  
  return {
  title: "TASKFLIX: Upcoming task",
  body: "Your task "${task.description}" is scheduled to start soon."
  };
  }

/**

* Listen for task updates so future reminder scheduling

* can be connected in a later integration step.
  */
  window.addEventListener("taskflix:tasks-updated", (event) => {
  const tasks = event.detail?.tasks;
  
  if (!Array.isArray(tasks)) {
  return;
  }
  
  // Reminder scheduling will be handled by the backend
  // after cloud storage and push delivery are configured.
  });
