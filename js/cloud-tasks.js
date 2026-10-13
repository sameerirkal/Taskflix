"use strict";

/* ==========================================
TASKFLIX — CLOUD TASK OPERATIONS
Supabase-backed task management
========================================== */

const TASKFLIX_TASKS_TABLE = "tasks";

function requireTaskflixCloudClient() {
const client = getTaskflixSupabaseClient();

if (!client) {
    throw new Error(
        "Cloud storage is not configured. Please check Supabase settings."
    );
}

return client;

}

async function getTaskflixCurrentUser() {
const client = requireTaskflixCloudClient();

const { data, error } = await client.auth.getUser();

if (error) {
    throw new Error(`Unable to verify your account: ${error.message}`);
}

if (!data.user) {
    throw new Error("Please sign in before managing tasks.");
}

return data.user;

}

/* Convert date and time into a comparable JavaScript date. */
function getTaskflixDateTime(dateValue, timeValue) {
if (!dateValue || !timeValue) {
return null;
}

// HTML date inputs normally return YYYY-MM-DD.
// HTML time inputs normally return HH:MM or HH:MM:SS.
const normalizedDate = String(dateValue).trim();
const normalizedTime = String(timeValue).trim();

const dateTime = new Date(`${normalizedDate}T${normalizedTime}`);

if (Number.isNaN(dateTime.getTime())) {
    return null;
}

return dateTime;

}

function validateTaskflixCloudSchedule(task) {
const start = getTaskflixDateTime(
task.start_date,
task.start_time
);

const end = getTaskflixDateTime(
    task.end_date,
    task.end_time
);

if (!start || !end || end <= start) {
    throw new Error(
        "Please enter a valid task schedule. The end date and time must be after the start date and time."
    );
}

}

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
    throw new Error(
        `Could not load tasks: ${error.message}`
    );
}

return Array.isArray(data) ? data : [];

}

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
    task.description.length > 500 ||
    !task.start_date ||
    !task.start_time ||
    !task.end_date ||
    !task.end_time
) {
    throw new Error(
        "Please provide a description (maximum 500 characters), start date/time and end date/time."
    );
}

// Validate using the actual input values.
validateTaskflixCloudSchedule(task);

const { data, error } = await client
    .from(TASKFLIX_TASKS_TABLE)
    .insert(task)
    .select(
        "id, user_id, description, start_date, start_time, end_date, end_time, completed, created_at"
    )
    .single();

if (error) {
    throw new Error(
        `Could not save task: ${error.message}`
    );
}

return data;

}

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
    updatedValues.description.length > 500 ||
    !updatedValues.start_date ||
    !updatedValues.start_time ||
    !updatedValues.end_date ||
    !updatedValues.end_time
) {
    throw new Error(
        "Please provide all required task fields. Description must be at most 500 characters."
    );
}

validateTaskflixCloudSchedule(updatedValues);

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
    throw new Error(
        `Could not update task: ${error.message}`
    );
}

return data;

}

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
    throw new Error(
        `Could not update task status: ${error.message}`
    );
}

return data;

}

async function deleteTaskflixCloudTask(taskId) {
const client = requireTaskflixCloudClient();
const user = await getTaskflixCurrentUser();

const { data, error } = await client
    .from(TASKFLIX_TASKS_TABLE)
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id)
    .select("id");

if (error) {
    throw new Error(
        `Could not delete task: ${error.message}`
    );
}

if (!data || data.length === 0) {
    throw new Error(
        "Task was not deleted. It may no longer exist or you may not have permission to delete it."
    );
}

return true;

}
