import ExcelJS from 'exceljs';
import { sql } from './sql';
import {calendar} from '../types/types';

async function check_working_day(year:number, month:number, day:number) :Promise<{status:number,comment:string}>{
  const file:calendar = require(`../api/office_calendar_${year-1911}.json`) as calendar;
  return new Promise(res=>{res(file[month][day])});
}

/**
 * 
 * @param {*} year 
 * @param {*} month 
 * @param {sql} sqlPlugin 
 */
export async function main(year:number,month:number,sqlPlugin:sql):Promise<void>{
    const reminders = sqlPlugin.showQueryInMonth(year,month);

    const totalDays = new Date(year, month, 0).getDate();

    let dailyReminders:{[key:number]:string[]} = {};
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
            let cal = await check_working_day(year, month, day)
            // Check if the day should be skipped.
            if (cal["status"] === 1) {
                if(cal["comment"]!=""){
                    dailyReminders[day].push(cal["comment"]);
                }
                continue;
            }
            
            // Determine the text to mark.
            let text = name;
            if (startDay === endDay) {
                if (end.getHours() <= 12) {
                    text += " 上午";
                } else if(start.getHours()>12){
                    text += " 下午";
                }
            } else if (day === startDay) {
                // Start day.
                if (start.getHours() < 12) {
                    text += " 上午";
                } else {
                    text += " 下午";
                }
            } else if (day === endDay) {
                // End day.
                // (If the end time is before noon—or exactly 12:00—mark as 上午.)
                if (end.getHours() < 12 || (end.getHours() === 12 && end.getMinutes() === 0)) {
                    text += " 上午";
                } else {
                    text += " 下午";
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
            let wcl = week[col];
            if (wcl==null) {
                cell.value = "";
            } else {
                // Compose cell text: "Day X" plus any reminder lines.
                let cellText = `Day ${wcl.day}`;
                if (wcl.reminders.length > 0) {
                    // Join multiple reminders with a newline.
                    cellText += "\n" + wcl.reminders.join("\n");
                }
                cell.value = cellText;
                cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
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
    workbook.xlsx.writeFile(`/app/calendars/${year}-${month}calendar.xlsx`)
        .then(() => {
            console.log('Excel file "calendar.xlsx" has been created.');
        })
        .catch((err) => {
            console.error(err);
        });
    return new Promise(res=>{
        res();
    })
}

// module.exports = main;