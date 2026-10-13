"use strict";

/* ==========================================
TASKFLIX — AUTHENTICATION
Supabase login, signup and logout
========================================== */

let taskflixAuthClient = null;

function showAuthMessage(message, type = "info") {
const element = document.getElementById("auth-message");

if (!element) return;

element.textContent = message;
element.className = "status-message";

if (["success", "warning", "error"].includes(type)) {
    element.classList.add(`status-${type}`);
}

}

function showTaskflixAuthState(session) {
const authSection = document.getElementById("auth-section");
const taskSection = document.getElementById("task-section");

const isSignedIn = Boolean(session?.user);

if (authSection) {
    authSection.hidden = isSignedIn;
}

if (taskSection) {
    taskSection.hidden = !isSignedIn;
}

window.dispatchEvent(
    new CustomEvent("taskflix:auth-state", {
        detail: {
            user: session?.user ?? null,
            session: session ?? null
        }
    })
);

}

async function signInUser(email, password) {
if (!taskflixAuthClient) {
throw new Error(
"Supabase is not configured. Please check js/supabase.js."
);
}

const { data, error } = await taskflixAuthClient.auth.signInWithPassword({
    email,
    password
});

if (error) {
    throw error;
}

return data;

}

async function signUpUser(email, password) {
if (!taskflixAuthClient) {
throw new Error(
"Supabase is not configured. Please check js/supabase.js."
);
}

// Replace this with your actual GitHub Pages website URL.
const redirectUrl = "https://sameerirkal.github.io/Taskflix/";

const { data, error } = await taskflixAuthClient.auth.signUp({
    email,
    password,
    options: {
        emailRedirectTo: redirectUrl
    }
});

if (error) {
    throw error;
}

return data;

}

async function signOutUser() {
if (!taskflixAuthClient) {
throw new Error("Supabase is not connected.");
}

const { error } = await taskflixAuthClient.auth.signOut();

if (error) {
    throw error;
}

}

document.addEventListener("DOMContentLoaded", async () => {
const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");
const logoutButton = document.getElementById("logout-button");
const authForm = document.getElementById("auth-form");

// Use the shared Supabase configuration.
taskflixAuthClient = initializeTaskflixSupabase();

if (!taskflixAuthClient) {
    showAuthMessage(
        "Cloud connection is not ready. Check your Supabase configuration.",
        "error"
    );

    return;
}

if (authForm) {
    authForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email =
            document.getElementById("email")?.value.trim() ?? "";

        const password =
            document.getElementById("password")?.value ?? "";

        if (loginButton) loginButton.disabled = true;
        if (signupButton) signupButton.disabled = true;

        try {
            await signInUser(email, password);

            showAuthMessage("Signed in successfully.", "success");
        } catch (error) {
            showAuthMessage(
                error.message || "Unable to sign in.",
                "error"
            );
        } finally {
            if (loginButton) loginButton.disabled = false;
            if (signupButton) signupButton.disabled = false;
        }
    });
}

if (signupButton) {
    signupButton.addEventListener("click", async () => {
        const email =
            document.getElementById("email")?.value.trim() ?? "";

        const password =
            document.getElementById("password")?.value ?? "";

        if (!email || !password) {
            showAuthMessage(
                "Enter your email and password before creating an account.",
                "warning"
            );
            return;
        }

        if (password.length < 8) {
            showAuthMessage(
                "Your password must contain at least 8 characters.",
                "warning"
            );
            return;
        }

        signupButton.disabled = true;

        try {
            const result = await signUpUser(email, password);

            if (result.session) {
                showAuthMessage(
                    "Account created successfully.",
                    "success"
                );
            } else {
                showAuthMessage(
                    "Account created. Check your email to confirm your account before signing in.",
                    "success"
                );
            }
        } catch (error) {
            showAuthMessage(
                error.message || "Unable to create your account.",
                "error"
            );
        } finally {
            signupButton.disabled = false;
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;

        try {
            await signOutUser();
            showAuthMessage("You have signed out.", "success");
        } catch (error) {
            showAuthMessage(
                error.message || "Unable to sign out.",
                "error"
            );
        } finally {
            logoutButton.disabled = false;
        }
    });
}

// React to login, logout and token refresh events.
taskflixAuthClient.auth.onAuthStateChange((_event, session) => {
    showTaskflixAuthState(session);
});

// Restore an existing session on page load.
try {
    const { data, error } =
        await taskflixAuthClient.auth.getSession();

    if (error) throw error;

    showTaskflixAuthState(data.session);
} catch (error) {
    showAuthMessage(
        "Unable to check your sign-in status. Please refresh the page.",
        "error"
    );
}

});
