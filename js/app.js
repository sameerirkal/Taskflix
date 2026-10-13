"use strict";

/* ==========================================
TASKFLIX — SHARED APPLICATION JAVASCRIPT
Theme preferences and shared functionality
========================================== */

document.addEventListener("DOMContentLoaded", () => {
initializeTheme();
initializeFooterYear();
});

/**

* Initialize the dark/light theme switch.

* Theme preference is stored separately from task data.
  */
  function initializeTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");
  const themeColorMeta = document.querySelector(
  'meta[name="theme-color"]'
  );
  
  const validThemes = ["dark", "light"];
  
  function getSavedTheme() {
  try {
  const savedTheme = localStorage.getItem("taskflix-theme");
  
       if (validThemes.includes(savedTheme)) {
         return savedTheme;
     }
 } catch (error) {
     console.warn(
         "TASKFLIX: Theme preference could not be loaded."
     );
 }

 return "dark";
  
  }
  
  function applyTheme(theme) {
  if (!validThemes.includes(theme)) {
  theme = "dark";
  }
  
   document.documentElement.setAttribute("data-theme", theme);

 if (themeToggle) {
     themeToggle.checked = theme === "light";

     themeToggle.setAttribute(
         "aria-checked",
         String(theme === "light")
     );
 }

 if (themeLabel) {
     themeLabel.textContent =
         theme === "light" ? "Light Mode" : "Dark Mode";
 }

 if (themeColorMeta) {
     themeColorMeta.setAttribute(
         "content",
         theme === "light" ? "#f5f7fb" : "#0b0d12"
     );
 }
  
  }
  
  function saveTheme(theme) {
  try {
  localStorage.setItem("taskflix-theme", theme);
  } catch (error) {
  console.warn(
  "TASKFLIX: Theme preference could not be saved."
  );
  }
  }
  
  // Apply the saved preference when the page loads.
  applyTheme(getSavedTheme());
  
  // Enable theme switching wherever the switch exists.
  if (themeToggle) {
  themeToggle.addEventListener("change", () => {
  const selectedTheme = themeToggle.checked
  ? "light"
  : "dark";
  
       applyTheme(selectedTheme);
     saveTheme(selectedTheme);
 });
  
  }
  }

/**

* Display the current year in any footer containing this element.
  */
  function initializeFooterYear() {
  const yearElement = document.getElementById("current-year");
  
  if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
  }
  }
