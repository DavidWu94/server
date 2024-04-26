const express = require('express');
const app = express();
const PORT = 3000;

// 處理POST請求
app.use(express.json());

app.post('/submit', (req, res) => {
  // 接收POST請求的資料
  const dataReceived = req.body;

  // 在這裡處理收到的資料，進行必要的處理
  // 這裡的例子是回傳一個固定的訊息和收到的資料
  const responseData = {
    message: '資料已收到！',
    receivedData: dataReceived
  };

  // 回傳處理後的資料作為回應
  res.json(responseData);
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log("test")
});