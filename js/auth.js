"use strict";

/* ==========================================
TASKFLIX — AUTHENTICATION MODULE
Supabase sign-in, sign-up and sign-out
========================================== */

/*

* SECURITY:
* Configure your Supabase project URL and publishable
* (anon) key before enabling authentication.
* 
* Never put a Supabase service_role key or any other
* privileged secret in browser JavaScript.
  */

const TASKFLIX_SUPABASE_URL = "";
const TASKFLIX_SUPABASE_PUBLISHABLE_KEY = "";

let taskflixSupabase = null;

/**

* Initialize Supabase using the library loaded by the HTML page.
  */
  function initializeSupabaseAuth() {
  if (
  typeof window.supabase === "undefined" ||
  typeof window.supabase.createClient !== "function"
  ) {
  console.error("TASKFLIX: Supabase library is not available.");
  return false;
  }
  
  if (
  !TASKFLIX_SUPABASE_URL ||
  !TASKFLIX_SUPABASE_PUBLISHABLE_KEY
  ) {
  console.warn(
  "TASKFLIX: Supabase configuration is not set up yet."
  );
  return false;
  }
  
  try {
  taskflixSupabase = window.supabase.createClient(
  TASKFLIX_SUPABASE_URL,
  TASKFLIX_SUPABASE_PUBLISHABLE_KEY
  );
  
   return true;
  
  } catch (error) {
  console.error("TASKFLIX: Supabase initialization failed.");
  return false;
  }
  }

/**

* Display an authentication message.
  */
  function showAuthMessage(message, type = "info") {
  const messageElement = document.getElementById("auth-message");
  
  if (!messageElement) {
  return;
  }
  
  messageElement.textContent = message;
  messageElement.className = "auth-message";
  
  if (["success", "error", "info"].includes(type)) {
  messageElement.classList.add(type);
  }
  }

/**

* Sign in an existing user.
  */
  async function signInUser(email, password) {
  if (!taskflixSupabase) {
  showAuthMessage(
  "Authentication is not configured yet. Please try again later.",
  "error"
  );
  return false;
  }
  
  try {
  const { data, error } =
  await taskflixSupabase.auth.signInWithPassword({
  email,
  password
  });
  
   if (error) {
     showAuthMessage(
         "Sign-in failed. Check your details and try again.",
         "error"
     );
     return false;
 }

 showAuthMessage("Sign-in successful.", "success");

 window.dispatchEvent(
     new CustomEvent("taskflix:auth-success", {
         detail: { user: data.user }
     })
 );

 return true;
  
  } catch (error) {
  showAuthMessage(
  "A connection error occurred. Please try again.",
  "error"
  );
  return false;
  }
  }

/**

* Create a new user account.
  */
  async function signUpUser(email, password) {
  if (!taskflixSupabase) {
  showAuthMessage(
  "Authentication is not configured yet. Please try again later.",
  "error"
  );
  return false;
  }
  
  try {
  const { data, error } = await taskflixSupabase.auth.signUp({
  email,
  password
  });
  
   if (error) {
     showAuthMessage(
         "Account creation failed. Check your details and try again.",
         "error"
     );
     return false;
 }

 if (data.session) {
     showAuthMessage(
         "Your account has been created successfully.",
         "success"
     );

     window.dispatchEvent(
         new CustomEvent("taskflix:auth-success", {
             detail: { user: data.user }
         })
     );
 } else {
     showAuthMessage(
         "Account created. Check your email to confirm your account.",
         "success"
     );
 }

 return true;
  
  } catch (error) {
  showAuthMessage(
  "A connection error occurred. Please try again.",
  "error"
  );
  return false;
  }
  }

/**

* Sign out the current user.
  */
  async function signOutUser() {
  if (!taskflixSupabase) {
  showAuthMessage(
  "Authentication is not configured yet.",
  "error"
  );
  return false;
  }
  
  try {
  const { error } = await taskflixSupabase.auth.signOut();
  
   if (error) {
     showAuthMessage(
         "Sign-out failed. Please try again.",
         "error"
     );
     return false;
 }

 window.dispatchEvent(
     new CustomEvent("taskflix:auth-signed-out")
 );

 return true;
  
  } catch (error) {
  showAuthMessage(
  "A connection error occurred. Please try again.",
  "error"
  );
  return false;
  }
  }

/**

* Connect authentication forms and buttons.
  */
  document.addEventListener("DOMContentLoaded", () => {
  const authForm = document.getElementById("auth-form");
  const signupButton = document.getElementById("signup-button");
  const logoutButton = document.getElementById("logout-button");
  
  initializeSupabaseAuth();
  
  if (authForm) {
  authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  
       const email = document
         .getElementById("email")
         ?.value.trim();

     const password = document.getElementById("password")?.value;

     if (!email || !password) {
         showAuthMessage(
             "Enter your email address and password.",
             "error"
         );
         return;
     }

     const loginButton = document.getElementById("login-button");

     if (loginButton) {
         loginButton.disabled = true;
     }

     await signInUser(email, password);

     if (loginButton) {
         loginButton.disabled = false;
     }
 });
  
  }
  
  if (signupButton) {
  signupButton.addEventListener("click", async () => {
  const email = document
  .getElementById("email")
  ?.value.trim();
  
       const password = document.getElementById("password")?.value;

     if (!email || !password) {
         showAuthMessage(
             "Enter your email address and password first.",
             "error"
         );
         return;
     }

     signupButton.disabled = true;

     await signUpUser(email, password);

     signupButton.disabled = false;
 });
  
  }
  
  if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  
       const success = await signOutUser();

     if (!success) {
         logoutButton.disabled = false;
     }
 });
  
  }
  });
