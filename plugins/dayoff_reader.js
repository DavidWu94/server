/**
 * scrape-download-json-firefox.js
 *
 * 用法：
 *   node scrape-download-json-firefox.js 112
 *
 * 說明：
 *   1. 進入 https://data.gov.tw/dataset/14718
 *   2. 先找出所有 class="resource-item" 的元素，令總數為 n； i 從 0 ~ n-1
 *   3. 利用 ID = resource${i} 的按鈕，檢查同一 li 下的 <span> 是否符合：
 *        - 包含 "{rocYear}年中華民國政府行政機關辦公日曆表"
 *        - 不含 "_Google行事曆專用"
 *   4. 若符合，點擊該按鈕 (進入詳細/預覽頁)
 *   5. 在詳細/預覽頁，尋找 class="el-button json" 的按鈕後，改用其父元素 <a> 的 href 進行檔案下載
 */

const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const axios = require('axios');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeAndDownload(rocYear) {
  // 建立 Firefox WebDriver
  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(new firefox.Options())
    .build();

  try {
    // STEP 1: 進入指定的 dataset 頁面
    await driver.get('https://data.gov.tw/dataset/14718');

    // 等待 .resource-item 出現
    await driver.wait(until.elementsLocated(By.css('.resource-item')), 15000);

    // 取得所有 resource-item
    let resourceItems = await driver.findElements(By.css('.resource-item'));
    const itemCount = resourceItems.length;
    console.log(`偵測到 ${itemCount} 個 .resource-item`);

    let downloaded = false;  // 用來標記是否已經成功下載

    // STEP 2: 迭代 i = 0 ~ itemCount - 1
    for (let i = 0; i < itemCount; i++) {
      const btnId = `resource${i}`;

      // 重新抓取 (避免 stale element reference)
      resourceItems = await driver.findElements(By.css('.resource-item'));

      let resourceBtn;
      try {
        resourceBtn = await driver.findElement(By.id(btnId));
      } catch (error) {
        console.log(`找不到按鈕 ID = ${btnId}，跳過`);
        continue;
      }

      // 找到該按鈕所屬的 li，再抓其中 <span>
      const parentLi = await resourceBtn.findElement(By.xpath('./ancestor::li'));
      const spanElems = await parentLi.findElements(By.css('span'));
      // 根據實際 DOM，假設要取第 3 個 <span>（index=2）
      const spanText = await spanElems[2].getText();

      // STEP 3: 檢查是否符合使用者輸入之 rocYear，且不含 "_Google行事曆專用"
      if (
        spanText.includes(`${rocYear}年中華民國政府行政機關辦公日曆表`) &&
        !spanText.includes('_Google行事曆專用')
      ) {
        console.log(`符合條件: li(i=${i}), spanText=${spanText}`);

        // STEP 4: 點擊該按鈕 (進入詳細/預覽頁)
        await sleep(1000);
        await resourceBtn.click();
        await sleep(1000);


        // 等待詳細/預覽頁的 el-button.json 出現
        await driver.wait(until.elementLocated(By.css('.el-button.json')), 8000);

        // STEP 5: 找到 class="el-button json" 的按鈕之後，用它的父元素 <a> 的 href 來下載
        let jsonButton;
        try {
          jsonButton = await driver.findElement(By.css('.el-button.json'));
        } catch (err) {
          console.log(`找不到 class="el-button json" 的按鈕，跳回上一頁繼續...`);
          await driver.navigate().back();
          continue;
        }

        // 拿到 parent <a>，提取 href
        const parentAnchor = await jsonButton.findElement(By.xpath('./parent::a'));
        const downloadHref = await parentAnchor.getAttribute('href');

        if (downloadHref) {
          console.log(`找到下載連結: ${downloadHref}`);
          // 用 axios 下載檔案
          try {
            const resp = await axios.get(downloadHref);

            // 儲存至本地檔案
            const filename = `../api/office_calendar_${rocYear}.json`;
            fs.writeFileSync(filename, JSON.stringify(resp.data, null, 2), 'utf8');

            console.log(`成功下載: ${filename}`);
            downloaded = true;
          } catch (downloadErr) {
            console.error('下載過程中發生錯誤：', downloadErr);
          }
        } else {
          console.log('父元素 <a> 未含有 href，無法下載。');
        }

        // 找到了正確檔案，便結束整個迴圈
        if (downloaded) break;
      } else {
        console.log(`li(i=${i}) 的 spanText 與需求不符合: ${spanText}`);
      }

      // 若沒符合條件，就回到列表頁，繼續檢查下一個
      await driver.navigate().back();
      await driver.wait(until.elementsLocated(By.css('.resource-item')), 8000);
    }

    if (!downloaded) {
      console.log(`\n無法找到符合 ${rocYear}年 且不含 "_Google行事曆專用" 的 JSON 資源。\n`);
    }
  } catch (error) {
    console.error('\n爬取或下載過程中發生錯誤：', error);
  } finally {
    // 關閉瀏覽器
    await driver.quit();
  }
}

async function rewriteJSON(rocYear) {
  let rawdata = fs.readFileSync(`../api/office_calendar_${rocYear}.json`);
  let rd= JSON.parse(rawdata);
  // console.log(punishments);
  let newData = {}
  for(let d of rd){
    let year = parseInt(d["西元日期"].substring(0,4));
    let month = parseInt(d["西元日期"].substring(4,6));
    let date = parseInt(d["西元日期"].substring(6));
    if(d["是否放假"]=="0") continue;
    try{
      newData[month][date] = 1;
    }catch{
      newData[month] = {};
      newData[month][date] = 1;
    }
  }

  let data = JSON.stringify(newData);
  fs.writeFileSync(`../api/office_calendar_${rocYear}.json`, data);
  
}

async function downloadJSON(rocYearArg) {
  await scrapeAndDownload(rocYearArg);
  await rewriteJSON(rocYearArg);
  return new Promise(res=>res);
}

async function dayoff_count(start,end) {
  try{
    
  }catch{

  }
  
}

// 如果從 CLI 執行，例如：node scrape-download-json-firefox.js 112
// (async()=>{
//   if (require.main === module) {
//     const rocYearArg = process.argv[2];
//     if (!rocYearArg) {
//       console.error('請提供民國年，範例：node scrape-download-json-firefox.js 112');
//       process.exit(1);
//     }
//   }
// })();
module.exports = downloadJSON;
