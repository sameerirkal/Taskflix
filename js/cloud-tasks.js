"use strict";

/* ==========================================
TASKFLIX — CLOUD TASK OPERATIONS
Supabase-backed task management
========================================== */

/*

* Requires js/supabase.js to be loaded first.
* The database table and RLS policies must exist
* before these functions can operate successfully.
  */

const TASKFLIX_TASKS_TABLE = "tasks";

function requireTaskflixCloudClient() {
const client = getTaskflixSupabaseClient();

if (!client) {
    throw new Error(
        "Cloud storage is not configured yet. Please configure Supabase first."
    );
}

return client;

}

/**

* Get the currently authenticated user.
  */
  async function getTaskflixCurrentUser() {
  const client = requireTaskflixCloudClient();
  
  const { data, error } = await client.auth.getUser();
  
  if (error) {
  throw new Error("Unable to verify the signed-in user.");
  }
  
  if (!data.user) {
  throw new Error("Please sign in before managing tasks.");
  }
  
  return data.user;
  }

/**

* Load the signed-in user's tasks.

* RLS must restrict access to the task owner.
  */
  async function loadTaskflixCloudTasks() {
  const client = requireTaskflixCloudClient();
  const user = await getTaskflixCurrentUser();
  
  const { data, error } = await client
  .from(TASKFLIX_TASKS_TABLE)
  .select(
  "id, user_id, description, start_date, start_time, end_date, end_time, completed, created_at"
  )
  .eq("user_id", user.id)
  .order("start_date", { ascending: true })
  .order("start_time", { ascending: true });
  
  if (error) {
  throw new Error("Could not load your tasks from cloud storage.");
  }
  
  return Array.isArray(data) ? data : [];
  }

/**

* Create a task in the cloud.
  */
  async function createTaskflixCloudTask(taskValues) {
  const client = requireTaskflixCloudClient();
  const user = await getTaskflixCurrentUser();
  
  const task = {
  user_id: user.id,
  description: String(taskValues.description ?? "").trim(),
  start_date: taskValues.start_date,
  start_time: taskValues.start_time,
  end_date: taskValues.end_date,
  end_time: taskValues.end_time,
  completed: false
  };
  
  if (
  !task.description ||
  !task.start_date ||
  !task.start_time ||
  !task.end_date ||
  !task.end_time
  ) {
  throw new Error("Please provide all required task fields.");
  }
  
  const start = new Date("${task.start_date}T${task.start_time}");
  const end = new Date("${task.end_date}T${task.end_time}");
  
  if (
  Number.isNaN(start.getTime()) ||
  Number.isNaN(end.getTime()) ||
  end <= start
  ) {
  throw new Error("Please enter a valid task schedule.");
  }
  
  const { data, error } = await client
  .from(TASKFLIX_TASKS_TABLE)
  .insert(task)
  .select(
  "id, user_id, description, start_date, start_time, end_date, end_time, completed, created_at"
  )
  .single();
  
  if (error) {
  throw new Error("Could not save the task to cloud storage.");
  }
  
  return data;
  }

/**

* Update a task belonging to the signed-in user.
  */
  async function updateTaskflixCloudTask(taskId, taskValues) {
  const client = requireTaskflixCloudClient();
  const user = await getTaskflixCurrentUser();
  
  const updatedValues = {
  description: String(taskValues.description ?? "").trim(),
  start_date: taskValues.start_date,
  start_time: taskValues.start_time,
  end_date: taskValues.end_date,
  end_time: taskValues.end_time
  };
  
  if (
  !updatedValues.description ||
  !updatedValues.start_date ||
  !updatedValues.start_time ||
  !updatedValues.end_date ||
  !updatedValues.end_time
  ) {
  throw new Error("Please provide all required task fields.");
  }
  
  const start = new Date(
  "${updatedValues.start_date}T${updatedValues.start_time}"
  );
  const end = new Date(
  "${updatedValues.end_date}T${updatedValues.end_time}"
  );
  
  if (
  Number.isNaN(start.getTime()) ||
  Number.isNaN(end.getTime()) ||
  end <= start
  ) {
  throw new Error("Please enter a valid task schedule.");
  }
  
  const { data, error } = await client
  .from(TASKFLIX_TASKS_TABLE)
  .update(updatedValues)
  .eq("id", taskId)
  .eq("user_id", user.id)
  .select(
  "id, user_id, description, start_date, start_time, end_date, end_time, completed, created_at"
  )
  .single();
  
  if (error) {
  throw new Error("Could not update the task in cloud storage.");
  }
  
  return data;
  }

/**

* Change a task's completion status.
  */
  async function setTaskflixCloudTaskCompletion(taskId, completed) {
  const client = requireTaskflixCloudClient();
  const user = await getTaskflixCurrentUser();
  
  const { data, error } = await client
  .from(TASKFLIX_TASKS_TABLE)
  .update({ completed: Boolean(completed) })
  .eq("id", taskId)
  .eq("user_id", user.id)
  .select("id, completed")
  .single();
  
  if (error) {
  throw new Error("Could not update the task completion status.");
  }
  
  return data;
  }

/**

* Delete a task belonging to the signed-in user.
  */
  async function deleteTaskflixCloudTask(taskId) {
  const client = requireTaskflixCloudClient();
  const user = await getTaskflixCurrentUser();
  
  const { error } = await client
  .from(TASKFLIX_TASKS_TABLE)
  .delete()
  .eq("id", taskId)
  .eq("user_id", user.id);
  
  if (error) {
  throw new Error("Could not delete the task from cloud storage.");
  }
  
  return true;
  }
