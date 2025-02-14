const ExcelJS = require('exceljs');

async function output_excel(data, year, month) {
  // 1. Sort the data array by the 'date' field (ascending).
  data.sort((a, b) => a["date"].localeCompare(b["date"]));

  // 2. Create a new workbook and add a worksheet.
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // 3. Add the header row.
  worksheet.addRow(['日期', '員工編號', '員工姓名', '上班時間', '下班時間']);

  // 4. Add a row for each item in the sorted data.
  data.forEach(item => {
    worksheet.addRow([
      item["date"],
      item["id"],
      item["name"],
      item["clockin"],
      item["clockout"]
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
