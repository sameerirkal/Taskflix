"use strict";

/* ==========================================
TASKFLIX — SUPABASE CLIENT
Cloud database connection foundation
========================================== */

/*

* Replace these empty strings with your Supabase
* project URL and publishable key when configured.
* 
* Never put a Supabase service_role or secret key
* in frontend JavaScript.
  */

const TASKFLIX_SUPABASE_URL = "";
const TASKFLIX_SUPABASE_PUBLISHABLE_KEY = "";

let taskflixSupabaseClient = null;

/**

* Initialize the Supabase browser client.

* Returns null until valid configuration is provided.
  */
  function initializeTaskflixSupabase() {
  if (
  !TASKFLIX_SUPABASE_URL ||
  !TASKFLIX_SUPABASE_PUBLISHABLE_KEY
  ) {
  console.info(
  "TASKFLIX: Supabase configuration has not been added yet."
  );
  
   return null;
  
  }
  
  if (
  typeof window.supabase === "undefined" ||
  typeof window.supabase.createClient !== "function"
  ) {
  console.error(
  "TASKFLIX: Supabase JavaScript library is not loaded."
  );
  
   return null;
  
  }
  
  if (taskflixSupabaseClient) {
  return taskflixSupabaseClient;
  }
  
  try {
  taskflixSupabaseClient = window.supabase.createClient(
  TASKFLIX_SUPABASE_URL,
  TASKFLIX_SUPABASE_PUBLISHABLE_KEY
  );
  
   return taskflixSupabaseClient;
  
  } catch (error) {
  console.error(
  "TASKFLIX: Could not initialize the Supabase client."
  );
  
   return null;
  
  }
  }

/**

* Return the initialized client, if available.
  */
  function getTaskflixSupabaseClient() {
  return taskflixSupabaseClient;
  }
