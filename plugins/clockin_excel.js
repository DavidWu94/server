const ExcelJS = require('exceljs');

async function output_excel(data, year, month) {
  // 1. Sort the data array by the 'date' field (ascending).
  data.sort((a, b) => a["date"].localeCompare(b["date"]));

  // 2. Group the records by date and name.
  // We use a key that combines date and name.
  const groups = {};
  data.forEach(item => {
    const key = `${item["date"]}-${item["name"]}`;
    if (!groups[key]) {
      // Initialize a group for this date and name.
      groups[key] = {
        date: item["date"],
        id: item["id"],       // Assuming the same id for the same person on a date.
        name: item["name"],
        clockIn: '',          // Will store the clock-in time (type === 1).
        clockOut: ''          // Will store the clock-out time (type === -1).
      };
    }
    // Assign time based on the type.
    if (item["type"] === 1) {
      groups[key].clockIn = item["time"];
    } else if (item["type"] === -1) {
      groups[key].clockOut = item["time"];
    }
  });

  // 3. Create a new workbook and add a worksheet.
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Add the header row.
  worksheet.addRow(['日期', '員工編號', '員工姓名', '上班時間', '下班時間']);

  // 4. Get the grouped records as an array and sort them (by date, then by name).
  const groupedArray = Object.values(groups).sort((a, b) => {
    if (a["date"] === b["date"]) {
      return a["name"].localeCompare(b["name"]);
    }
    return a["date"].localeCompare(b["date"]);
  });

  // Add a row for each group.
  groupedArray.forEach(group => {
    worksheet.addRow([
      group["date"],
      group["id"],
      group["name"],
      group["clockIn"],
      group["clockOut"]
    ]);
  });

  // 5. Write the workbook to a file.
  try {
    await workbook.xlsx.writeFile(`/app/clock/${year}-${month}clockin_record.xlsx`);
    console.log('Excel file created successfully!');
  } catch (err) {
    console.error('Error writing excel file:', err);
  }
  
  return new Promise((res) => {
    res();
  });
}

module.exports = output_excel;