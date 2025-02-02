/**
 * Node.js program to generate a monthly calendar as an Excel file
 * with reminders based on reminder objects. Each reminder object is of the form:
 *
 *    { "start": "YYYY-MM-DD HH:MM", "end": "YYYY-MM-DD HH:MM", "name": "david" }
 *
 * For each reminder, all the days between start and end (inclusive) are marked unless
 * an existing function check_working_day(year, month, day) returns 1.
 *
 * Marking rules:
 *   - On the start day: if the start time is before noon, mark "name morning", otherwise "name afternoon".
 *   - On the end day: if the end time is before noon (or exactly 12:00), mark "name morning", otherwise "name afternoon".
 *   - Intermediate days: just mark "name".
 *
 * Finally, the program creates an Excel file ("calendar.xlsx") with the calendar.
 *
 * Note: Adjust the implementation of check_working_day() as needed.
 */

// ---------------------------
// Required Modules
// ---------------------------
const ExcelJS = require('exceljs');


// ---------------------------
// Dummy Implementation: check_working_day
// ---------------------------
/**
 * This is a stub for the existing function.
 * In this example, we assume that if a day falls on Saturday or Sunday, 
 * check_working_day returns 1 (meaning “do not mark”).
 *
 * Adjust this function as needed.
 */
function check_working_day(year, month, day) {
  const file = require(`./office_calendar_${year-1911}.json`);
  return file[month][day];
}


function main(year,month){

    // ---------------------------
    // Input Parameters
    // ---------------------------
    // const month = 1; // February
    // const year = 2025;

    // Example reminders array (unsorted, may contain multiple entries)
    const reminders = [
    { "start": "2025-01-06 13:30", "end": "2025-01-09 12:00", "name": "david" },
    { "start": "2025-01-07 13:30", "end": "2025-01-08 12:00", "name": "toby" },
    { "start": "2025-01-10 13:30", "end": "2025-01-13 12:00", "name": "cat" },
    // You can add more reminder objects here.
    ];

    // ---------------------------
    // Process Reminders and Build Daily Mapping
    // ---------------------------

    // Get total days in the month.
    const totalDays = new Date(year, month, 0).getDate();

    // Create a mapping from day (1-based) to an array of reminder strings.
    let dailyReminders = {};
    for (let d = 1; d <= totalDays; d++) {
    dailyReminders[d] = [];
    }

    // Process each reminder object.
    for (const rem of reminders) {
    // Convert the "start" and "end" strings to Date objects.
    // (Replace the space with "T" so that the ISO format is acceptable.)
    const start = new Date(rem.start.replace(" ", "T"));
    const end = new Date(rem.end.replace(" ", "T"));
    const name = rem.name;
    const startDay = start.getDate();
    const endDay = end.getDate();
    
    // Loop through each day in the reminder's span.
    for (let day = startDay; day <= endDay; day++) {
        // Check if the day should be skipped.
        if (check_working_day(year, month, day) === 1) {
        continue;
        }
        
        // Determine the text to mark.
        let text = name;
        if (startDay === endDay) {
        // Single-day event.
        // Use the start time to decide.
        if (start.getHours() < 12) {
            text += " morning";
        } else {
            text += " afternoon";
        }
        } else if (day === startDay) {
        // Start day.
        if (start.getHours() < 12) {
            text += " morning";
        } else {
            text += " afternoon";
        }
        } else if (day === endDay) {
        // End day.
        // (If the end time is before noon—or exactly 12:00—mark as morning.)
        if (end.getHours() < 12 || (end.getHours() === 12 && end.getMinutes() === 0)) {
            text += " morning";
        } else {
            text += " afternoon";
        }
        }
        // For intermediate days, leave text as just the name.
        
        dailyReminders[day].push(text);
    }
    }
    // ---------------------------
    // Build the Calendar Grid
    // ---------------------------
    // Create a grid (an array of weeks), where each week is an array of 7 cells.
    // A cell is either null (if there is no date) or an object { day, reminders }.
    let weeks = [];
    let currentWeek = [];

    // Determine the day-of-week index (0=Sunday, …,6=Saturday) for the first day.
    const firstDayIndex = new Date(year, month - 1, 1).getDay();

    // Pad the first week with null cells.
    for (let i = 0; i < firstDayIndex; i++) {
    currentWeek.push(null);
    }

    // Fill in the days.
    for (let day = 1; day <= totalDays; day++) {
    currentWeek.push({ day, reminders: dailyReminders[day] });
    if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
    }
    }

    // If the last week is not full, pad it with null cells.
    if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
        currentWeek.push(null);
    }
    weeks.push(currentWeek);
    }

    // ---------------------------
    // Create the Excel Calendar
    // ---------------------------
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Calendar');

    // Define the days-of-week headers.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    // Set up worksheet columns (7 columns: one per day).
    worksheet.columns = [
    { header: dayNames[0], key: 'sun', width: 20 },
    { header: dayNames[1], key: 'mon', width: 20 },
    { header: dayNames[2], key: 'tue', width: 20 },
    { header: dayNames[3], key: 'wed', width: 20 },
    { header: dayNames[4], key: 'thu', width: 20 },
    { header: dayNames[5], key: 'fri', width: 20 },
    { header: dayNames[6], key: 'sat', width: 20 }
    ];

    // --- Title Row ---
    // Merge cells A1 to G1 for the calendar title.
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `${monthNames[month - 1]} ${year}`;
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.font = { bold: true, size: 20 };
    worksheet.getRow(1).height = 30;

    // --- Header Row ---
    // The header row (day names) will be in row 2.
    const headerRow = worksheet.getRow(2);
    headerRow.values = dayNames;
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 20;

    // --- Calendar Grid ---
    // Start filling in the grid beginning at row 3.
    let currentRowNumber = 3;
    for (let week of weeks) {
    const row = worksheet.getRow(currentRowNumber);
    for (let col = 0; col < 7; col++) {
        const cell = row.getCell(col + 1);
        if (week[col] !== null) {
        // Compose cell text: "Day X" plus any reminder lines.
        let cellText = `Day ${week[col].day}`;
        if (week[col].reminders.length > 0) {
            // Join multiple reminders with a newline.
            cellText += "\n" + week[col].reminders.join("\n");
        }
        cell.value = cellText;
        cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
        } else {
        cell.value = "";
        }
        // Optional: add a border to the cell.
        cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
        };
    }
    row.height = 60; // Adjust row height as needed.
    currentRowNumber++;
    }

    // ---------------------------
    // Write the Excel File
    // ---------------------------
    workbook.xlsx.writeFile('calendar.xlsx')
    .then(() => {
        console.log('Excel file "calendar.xlsx" has been created.');
    })
    .catch((err) => {
        console.error(err);
    });
}

module.exports = main;