"use strict";

/* ==========================================
TASKFLIX — EXCEL IMPORT / EXPORT
Bulk cloud import and EOD report export
========================================== */

const TASKFLIX_EXCEL_COLUMNS = [
"Description",
"Start Date",
"Start Time",
"End Date",
"End Time"
];

const TASKFLIX_EOD_COLUMNS = [
"Description",
"Task Completion Status"
];

/* Normalize dates from Excel or HTML-compatible strings. */
function normalizeExcelDate(value) {
if (value instanceof Date && !Number.isNaN(value.getTime())) {
return [
value.getFullYear(),
String(value.getMonth() + 1).padStart(2, "0"),
String(value.getDate()).padStart(2, "0")
].join("-");
}

const text = String(value ?? "").trim();

if (!text) return "";

// Already in YYYY-MM-DD format.
const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
}

// Support DD-MM-YYYY and DD/MM/YYYY.
const localMatch = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

if (localMatch) {
    const day = Number(localMatch[1]);
    const month = Number(localMatch[2]);
    const year = Number(localMatch[3]);

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return "";
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

return "";

}

/* Normalize Excel time values to HH:MM. */
function normalizeExcelTime(value) {
if (value instanceof Date && !Number.isNaN(value.getTime())) {
return "${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}";
}

const text = String(value ?? "").trim();

if (!text) return "";

const match = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);

if (!match) return "";

let hours = Number(match[1]);
const minutes = Number(match[2]);
const meridiem = match[4]?.toUpperCase();

if (minutes > 59) return "";

if (meridiem) {
    if (hours < 1 || hours > 12) return "";

    if (meridiem === "AM") {
        hours = hours === 12 ? 0 : hours;
    } else {
        hours = hours === 12 ? 12 : hours + 12;
    }
} else if (hours > 23) {
    return "";
}

return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

}

function validateExcelTaskRow(row, rowNumber) {
const description = String(row["Description"] ?? "").trim();
const startDate = normalizeExcelDate(row["Start Date"]);
const startTime = normalizeExcelTime(row["Start Time"]);
const endDate = normalizeExcelDate(row["End Date"]);
const endTime = normalizeExcelTime(row["End Time"]);

if (!description) {
    return `Row ${rowNumber}: Description is required.`;
}

if (description.length > 500) {
    return `Row ${rowNumber}: Description cannot exceed 500 characters.`;
}

if (!startDate || !startTime || !endDate || !endTime) {
    return `Row ${rowNumber}: One or more dates/times are invalid or missing. Use dates such as 2026-10-14 and times such as 09:30 or 02:30 PM.`;
}

const start = new Date(`${startDate}T${startTime}`);
const end = new Date(`${endDate}T${endTime}`);

if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
) {
    return `Row ${rowNumber}: Invalid date or time.`;
}

if (end <= start) {
    return `Row ${rowNumber}: End date and time must be after the start.`;
}

return null;

}

function validateExcelHeaders(headers) {
if (!Array.isArray(headers)) {
return {
valid: false,
message: "Unable to read the Excel column headers."
};
}

const normalizedHeaders = headers.map((header) =>
    String(header ?? "").trim()
);

const missingColumns = TASKFLIX_EXCEL_COLUMNS.filter(
    (column) => !normalizedHeaders.includes(column)
);

if (missingColumns.length > 0) {
    return {
        valid: false,
        message: `Missing required columns: ${missingColumns.join(", ")}.`
    };
}

return {
    valid: true,
    message: "Excel headers are valid."
};

}

function parseTaskExcelFile(file) {
return new Promise((resolve, reject) => {
if (typeof XLSX === "undefined") {
reject(new Error("Excel library is not loaded."));
return;
}

    if (!file) {
        reject(new Error("Please select an Excel file."));
        return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
        reject(new Error("Unable to read the selected file."));
    };

    reader.onload = (event) => {
        try {
            const workbook = XLSX.read(event.target.result, {
                type: "array",
                cellDates: true
            });

            const firstSheetName = workbook.SheetNames[0];

            if (!firstSheetName) {
                reject(new Error("The Excel workbook contains no worksheets."));
                return;
            }

            const worksheet = workbook.Sheets[firstSheetName];

            // Read the first row separately so headers are checked reliably.
            const matrix = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: "",
                raw: true
            });

            if (matrix.length < 2) {
                reject(new Error("The worksheet must contain headers and at least one task row."));
                return;
            }

            const headerCheck = validateExcelHeaders(matrix[0]);

            if (!headerCheck.valid) {
                reject(new Error(headerCheck.message));
                return;
            }

            const headers = matrix[0].map((header) =>
                String(header ?? "").trim()
            );

            const validTasks = [];
            const errors = [];

            for (let index = 1; index < matrix.length; index += 1) {
                const values = matrix[index];

                if (
                    values.every((value) =>
                        String(value ?? "").trim() === ""
                    )
                ) {
                    continue;
                }

                const row = {};

                headers.forEach((header, columnIndex) => {
                    row[header] = values[columnIndex] ?? "";
                });

                const rowNumber = index + 1;
                const validationError = validateExcelTaskRow(row, rowNumber);

                if (validationError) {
                    errors.push(validationError);
                    continue;
                }

                validTasks.push({
                    description: String(row["Description"]).trim(),
                    start_date: normalizeExcelDate(row["Start Date"]),
                    start_time: normalizeExcelTime(row["Start Time"]),
                    end_date: normalizeExcelDate(row["End Date"]),
                    end_time: normalizeExcelTime(row["End Time"])
                });
            }

            resolve({
                tasks: validTasks,
                errors
            });
        } catch (error) {
            reject(
                new Error(
                    `Could not process the Excel file: ${error.message}`
                )
            );
        }
    };

    reader.readAsArrayBuffer(file);
});

}

/*

* Import validated tasks into Supabase one at a time.

* Existing RLS policies keep each user's tasks private.
  */
  async function importTasksToCloud(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
  throw new Error("There are no valid tasks to import.");
  }
  
  const imported = [];
  const errors = [];
  
  for (let index = 0; index < tasks.length; index += 1) {
  try {
  const task = await createTaskflixCloudTask(tasks[index]);
  imported.push(task);
  } catch (error) {
  errors.push(
  "Task ${index + 1} (${tasks[index].description}): ${error.message}"
  );
  }
  }
  
  // Refresh the task list after the import attempt.
  window.dispatchEvent(new CustomEvent("taskflix:tasks-updated"));
  
  return {
  imported,
  errors
  };
  }

function exportEODTasksToExcel(tasks) {
if (typeof XLSX === "undefined") {
throw new Error("Excel library is not loaded.");
}

if (!Array.isArray(tasks)) {
    throw new Error("A valid task list is required for export.");
}

const exportRows = tasks.map((task) => ({
    "Description": String(task.description ?? ""),
    "Task Completion Status": task.completed ? "Completed" : "Pending"
}));

const worksheet = XLSX.utils.json_to_sheet(exportRows, {
    header: TASKFLIX_EOD_COLUMNS
});

const workbook = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "EOD Task Report"
);

const today = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, "0"),
    String(new Date().getDate()).padStart(2, "0")
].join("-");

XLSX.writeFile(workbook, `TASKFLIX_EOD_${today}.xlsx`);

}


/* ==========================================
TASKFLIX — EXCEL UI EVENT HANDLERS
========================================== */

document.addEventListener("DOMContentLoaded", () => {
const importForm = document.getElementById("excel-import-form");
const fileInput = document.getElementById("excel-file");
const importButton = document.getElementById("excel-import-button");
const importMessage = document.getElementById("excel-import-message");
const importErrors = document.getElementById("excel-import-errors");

const exportButton = document.getElementById("excel-export-button");
const exportMessage = document.getElementById("excel-export-message");

if (importForm) {
    importForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        importMessage.textContent = "";
        importErrors.textContent = "";
        importErrors.hidden = true;

        const file = fileInput?.files?.[0];

        if (!file) {
            importMessage.textContent = "Please select an Excel file first.";
            return;
        }

        importButton.disabled = true;
        importButton.textContent = "Importing...";

        try {
            const result = await parseTaskExcelFile(file);

            if (result.tasks.length === 0) {
                importMessage.textContent =
                    "No valid tasks were found. Check the Excel file and row errors below.";
            } else {
                const importResult = await importTasksToCloud(result.tasks);

                importMessage.textContent =
                    `Successfully imported ${importResult.imported.length} of ${result.tasks.length} valid tasks.`;

                result.errors.push(...importResult.errors);
            }

            if (result.errors.length > 0) {
                importErrors.textContent = result.errors.join("\n");
                importErrors.hidden = false;
            }

            if (typeof loadCloudTasks === "function") {
                await loadCloudTasks();
            }

            fileInput.value = "";
        } catch (error) {
            importMessage.textContent =
                error.message || "An unexpected error occurred during import.";
        } finally {
            importButton.disabled = false;
            importButton.textContent = "Import Tasks";
        }
    });
}

if (exportButton) {
    exportButton.addEventListener("click", async () => {
        exportMessage.textContent = "";

        exportButton.disabled = true;
        exportButton.textContent = "Preparing report...";

        try {
            if (typeof loadCloudTasks === "function") {
                await loadCloudTasks();
            }

            if (!Array.isArray(window.taskflixTasks)) {
                throw new Error(
                    "Tasks are not available yet. Please sign in and try again."
                );
            }

            exportEODTasksToExcel(window.taskflixTasks);

            exportMessage.textContent =
                "Your EOD report has been downloaded successfully.";
        } catch (error) {
            exportMessage.textContent =
                error.message || "Unable to export the EOD report.";
        } finally {
            exportButton.disabled = false;
            exportButton.textContent = "Download EOD Report";
        }
    });
}

});
