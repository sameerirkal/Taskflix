"use strict";

// ========================================
// TASKFLIX — Theme Management
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    const themeSelect = document.getElementById("theme-select");
    const themeColorMeta = document.querySelector(
        'meta[name="theme-color"]'
    );

    if (!themeSelect) {
        console.error("TASKFLIX: Theme selector was not found.");
        return;
    }

    const validThemes = ["dark", "light", "system"];

    // Read the saved preference safely.
    function getSavedTheme() {
        try {
            const savedTheme = localStorage.getItem("taskflix-theme");

            if (validThemes.includes(savedTheme)) {
                return savedTheme;
            }
        } catch (error) {
            console.warn("Theme preference could not be loaded.");
        }

        return "dark";
    }

    // Apply the selected theme.
    function applyTheme(theme) {
        if (!validThemes.includes(theme)) {
            theme = "dark";
        }

        const root = document.documentElement;

        if (theme === "system") {
            root.removeAttribute("data-theme");
        } else {
            root.setAttribute("data-theme", theme);
        }

        themeSelect.value = theme;

        // Keep the browser's address bar color in sync.
        if (themeColorMeta) {
            const prefersLight =
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: light)").matches;

            let backgroundColor = "#0b0d12";

            if (theme === "light" || (theme === "system" && prefersLight)) {
                backgroundColor = "#f5f7fb";
            }

            themeColorMeta.setAttribute("content", backgroundColor);
        }
    }

    // Save the user's preference.
    function saveTheme(theme) {
        try {
            localStorage.setItem("taskflix-theme", theme);
        } catch (error) {
            console.warn("Theme preference could not be saved.");
        }
    }

    // Initialize the saved preference.
    const initialTheme = getSavedTheme();
    applyTheme(initialTheme);

    // Respond to changes in the dropdown.
    themeSelect.addEventListener("change", () => {
        const selectedTheme = themeSelect.value;

        if (!validThemes.includes(selectedTheme)) {
            return;
        }

        applyTheme(selectedTheme);
        saveTheme(selectedTheme);
    });

    // Update automatically if System is selected and
    // the device's appearance preference changes.
    if (window.matchMedia) {
        const systemPreference = window.matchMedia(
            "(prefers-color-scheme: light)"
        );

        systemPreference.addEventListener("change", () => {
            if (themeSelect.value === "system") {
                applyTheme("system");
            }
        });
    }

    // Update the footer year.
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
