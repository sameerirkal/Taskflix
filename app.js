"use strict";

document.addEventListener("DOMContentLoaded", () => {
const themeToggle = document.getElementById("theme-toggle");
const themeLabel = document.getElementById("theme-label");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const yearElement = document.getElementById("current-year");

// Automatically display the current year in the footer.
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

const validThemes = ["dark", "light"];

// Load the saved theme preference.
function getSavedTheme() {
    try {
        const savedTheme = localStorage.getItem("taskflix-theme");

        if (validThemes.includes(savedTheme)) {
            return savedTheme;
        }
    } catch (error) {
        console.warn("TASKFLIX: Theme preference could not be loaded.");
    }

    return "dark";
}

// Apply the selected theme to the page.
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

// Save the selected theme preference.
function saveTheme(theme) {
    try {
        localStorage.setItem("taskflix-theme", theme);
    } catch (error) {
        console.warn("TASKFLIX: Theme preference could not be saved.");
    }
}

// Initialize the theme when the page loads.
applyTheme(getSavedTheme());

// Switch between dark and light modes.
if (themeToggle) {
    themeToggle.addEventListener("change", () => {
        const selectedTheme = themeToggle.checked ? "light" : "dark";

        applyTheme(selectedTheme);
        saveTheme(selectedTheme);
    });
}

});
