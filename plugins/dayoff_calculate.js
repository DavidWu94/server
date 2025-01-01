const fs = require('fs');
const path = require('path');
const download = require("./dayoff_reader");

/**
 * 將 Gregorian 年轉換為 ROC 年
 * @param {number} gregorianYear - 公元年
 * @returns {number} - 民國年
 */
function convertGregorianToROCYear(gregorianYear) {
    return gregorianYear - 1911;
}

/**
 * 載入特定 ROC 年的非工作日 JSON 文件
 * @param {number} rocYear - 民國年
 * @returns {Promise<Set>} - 包含 'MM-DD' 格式的非工作日
 */
async function loadNonWorkingDays(rocYear) {
    const filePath = `./api/office_calendar_${rocYear}.json`;

    if (!fs.existsSync(filePath)) {
        console.log("Can't find file.");
        await download(rocYear)
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // console.log(data)

    const nonWorkingDays = new Set();
    for (const month in data) {
        const days = data[month];
        for (const day in days) {
            const monthStr = month.padStart(2, '0');
            const dayStr = day.padStart(2, '0');
            nonWorkingDays.add(`${monthStr}-${dayStr}`);
        }
    }

    return new Promise(res=>{res(nonWorkingDays)});
}

/**
 * 取得日期範圍內所有涉及的 ROC 年
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {Set<number>} - 包含所有 ROC 年
 */
function getROCYearsInRange(startDate, endDate) {
    const years = new Set();
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
        years.add(convertGregorianToROCYear(year));
    }

    return years;
}

/**
 * 判斷某日期是否為非工作日
 * @param {Date} date 
 * @param {Set} nonWorkingDaysSet 
 * @returns {boolean}
 */
async function isNonWorkingDay(date, nonWorkingDaysSet) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回 0-11
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${month}-${day}`;
    return new Promise(res=>{res(nonWorkingDaysSet.has(dateStr))});
}

/**
 * 將 Date 物件轉換為十進制小時數（例如，8:30 轉為 8.5）
 * @param {Date} date 
 * @returns {number}
 */
function getDecimalTime(date) {
    return date.getHours() + date.getMinutes() / 60;
}

/**
 * 計算工作段的工作時數
 * @param {number} periodStart - 工作段開始時間（十進制小時）
 * @param {number} periodEnd - 工作段結束時間（十進制小時）
 * @param {number} intervalStart - 當天的工作區間開始時間（十進制小時）
 * @param {number} intervalEnd - 當天的工作區間結束時間（十進制小時）
 * @returns {number} - 計算出的工作時數
 */
async function calculateWorkingHoursForPeriod(periodStart, periodEnd, intervalStart, intervalEnd) {
    if (intervalStart <= periodStart && intervalEnd >= periodEnd) {
        return 4;
    }

    const overlapStart = Math.max(intervalStart, periodStart);
    const overlapEnd = Math.min(intervalEnd, periodEnd);
    const hours = overlapEnd - overlapStart;
    return new Promise(res=>{res(hours > 0 ? hours : 0)});
}

/**
 * 計算兩個時間點之間的工作時數，排除非工作日
 * @param {string} time1 - 開始時間，格式為 "YYYY-MM-DD HH:MM"
 * @param {string} time2 - 結束時間，格式為 "YYYY-MM-DD HH:MM"
 * @returns {number} - 經過的工作時數
 */
async function caculateTime(time1, time2) {
    const date1 = new Date(time1);
    const date2 = new Date(time2);

    if (isNaN(date1) || isNaN(date2)) {
        throw new Error("Invalid date format. Please use 'YYYY-MM-DD HH:MM'.");
    }

    if (date2 < date1) {
        throw new Error("time2 必須大於或等於 time1");
    }

    let totalHours = 0;

    // 定義工作段
    const morningStart = 8.5;    // 8:30
    const morningEnd = 12.0;     // 12:00
    const afternoonStart = 13.5; // 13:30
    const afternoonEnd = 17.5;   // 17:30

    // 獲取所有涉及的 ROC 年
    const rocYears = getROCYearsInRange(date1, date2);

    // 載入所有涉及的 ROC 年的非工作日

    const allNonWorkingDays = await fetch_all_nwd(rocYears);
    // new Set();

    // 初始化當前日期為 date1 的日期部分
    let currentDate = new Date(date1);
    currentDate.setHours(0, 0, 0, 0);

    // 迴圈遍歷每一天
    while (currentDate <= date2) {
        // 檢查是否為工作日
        // console.log(allNonWorkingDays)
        let tp = await isNonWorkingDay(currentDate, allNonWorkingDays);
        // console.log(tp)
        if (!tp) {
            // 定義當天的工作區間
            let intervalStart = morningStart;
            let intervalEnd = afternoonEnd;

            if (currentDate.toDateString() === date1.toDateString()) {
                // 起始日
                intervalStart = Math.max(getDecimalTime(date1), morningStart);
            }

            if (currentDate.toDateString() === date2.toDateString()) {
                // 終止日
                intervalEnd = Math.min(getDecimalTime(date2), afternoonEnd);
            }

            // 計算上午工作時數
            let morningIntervalStart = intervalStart;
            let morningIntervalEnd = intervalEnd;

            if (currentDate.toDateString() === date1.toDateString()) {
                morningIntervalStart = Math.max(getDecimalTime(date1), morningStart);
            }

            if (currentDate.toDateString() === date2.toDateString()) {
                morningIntervalEnd = Math.min(getDecimalTime(date2), morningEnd);
            }

            let morningHours = await calculateWorkingHoursForPeriod(morningStart, morningEnd, morningIntervalStart, morningIntervalEnd);

            // 計算下午工作時數
            let afternoonIntervalStart = intervalStart;
            let afternoonIntervalEnd = intervalEnd;

            if (currentDate.toDateString() === date1.toDateString()) {
                afternoonIntervalStart = Math.max(getDecimalTime(date1), afternoonStart);
            }

            if (currentDate.toDateString() === date2.toDateString()) {
                afternoonIntervalEnd = Math.min(getDecimalTime(date2), afternoonEnd);
            }

            let afternoonHours = await calculateWorkingHoursForPeriod(afternoonStart, afternoonEnd, afternoonIntervalStart, afternoonIntervalEnd);

            totalHours += morningHours + afternoonHours;
        }

        // 移動到下一天
        currentDate.setDate(currentDate.getDate() + 1);
    }
    // console.log(totalHours)
    return new Promise(res=>{res(totalHours)});
}

async function fetch_all_nwd(rocYears) {
    const allNonWorkingDays = new Set();
    for(rocYear of rocYears){
        const nonWorkingDays = await loadNonWorkingDays(rocYear);
        for(day of nonWorkingDays){
            allNonWorkingDays.add(day);
        }
    }
    return new Promise(res=>{
        res(allNonWorkingDays);
    })
}


module.exports = caculateTime;