"use strict";

/* ==========================================
TASKFLIX — EXCEL IMPORT / EXPORT MODULE
Bulk task import and EOD task export
========================================== */

/*

* Excel processing uses SheetJS.
* The library and UI controls will be connected
* to the HTML page during integration.
  */

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

/**

* Validate an imported Excel row.

* Returns an error message, or null when valid.
  */
  function validateExcelTaskRow(row, rowNumber) {
  const description = String(row["Description"] ?? "").trim();
  const startDate = String(row["Start Date"] ?? "").trim();
  const startTime = String(row["Start Time"] ?? "").trim();
  const endDate = String(row["End Date"] ?? "").trim();
  const endTime = String(row["End Time"] ?? "").trim();
  
  if (!description) {
  return "Row ${rowNumber}: Description is required.";
  }
  
  if (!startDate || !startTime || !endDate || !endTime) {
  return "Row ${rowNumber}: Start and end dates and times are required.";
  }
  
  const start = new Date("${startDate}T${startTime}");
  const end = new Date("${endDate}T${endTime}");
  
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
  return "Row ${rowNumber}: Invalid date or time.";
  }
  
  if (end <= start) {
  return "Row ${rowNumber}: End date and time must be after the start.";
  }
  
  return null;
  }

/**

* Check that the Excel file has the required headers.
  */
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
  message: "Missing required columns: ${missingColumns.join(", ")}."
  };
  }
  
  return {
  valid: true,
  message: "Excel headers are valid."
  };
  }

/**

* Read and validate tasks from an Excel workbook.

* Returns validated rows and any row-level errors.
  */
  function parseTaskExcelFile(file) {
  return new Promise((resolve, reject) => {
  if (typeof XLSX === "undefined") {
  reject(
  new Error(
  "Excel library is not loaded. Please connect the SheetJS library first."
  )
  );
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
             cellDates: false
         });

         const firstSheetName = workbook.SheetNames[0];

         if (!firstSheetName) {
             reject(new Error("The Excel workbook contains no worksheets."));
             return;
         }

         const worksheet = workbook.Sheets[firstSheetName];

         const rows = XLSX.utils.sheet_to_json(worksheet, {
             defval: "",
             raw: false
         });

         if (rows.length === 0) {
             reject(new Error("The selected worksheet contains no task rows."));
             return;
         }

         const headerCheck = validateExcelHeaders(
             Object.keys(rows[0])
         );

         if (!headerCheck.valid) {
             reject(new Error(headerCheck.message));
             return;
         }

         const validTasks = [];
         const errors = [];

         rows.forEach((row, index) => {
             const rowNumber = index + 2;
             const error = validateExcelTaskRow(row, rowNumber);

             if (error) {
                 errors.push(error);
                 return;
             }

             validTasks.push({
                 description: String(row["Description"]).trim(),
                 start_date: String(row["Start Date"]).trim(),
                 start_time: String(row["Start Time"]).trim(),
                 end_date: String(row["End Date"]).trim(),
                 end_time: String(row["End Time"]).trim()
             });
         });

         resolve({
             tasks: validTasks,
             errors
         });
     } catch (error) {
         reject(
             new Error(
                 "Could not process the Excel file. Please check its format."
             )
         );
     }
 };

 reader.readAsArrayBuffer(file);
  
  });
  }

/**

* Export task completion status using the exact EOD columns.

* 

* Each task should provide:

* - description

* - completed (boolean)
    */
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
  
  const today = new Date().toISOString().slice(0, 10);
  
  XLSX.writeFile(workbook, "TASKFLIX_EOD_${today}.xlsx");
  }
