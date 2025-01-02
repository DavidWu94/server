
## 1. Check Server Status

![GET](https://img.shields.io/badge/GET-0052CC?style=flat-square&logo=appveyor&logoColor=white) `/`

**Description:**  
Check if the server is online.

**Request:**
```http
GET /
```

**Response:**
- **200 OK**: Server is online.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error

---

## 2. Login

![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/login`

**Description:**  
Login to the system.

**Request Body:**
```json
{
  "account": "string",   // The account the user typed in.
  "pwd": "string",       // The password the user typed in.
  "twoFA": "string"      // Only for root account. (Optional)
}
```

**Response:**
- **200 OK**: Successful login with session cookie.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error

---

## 3. Register a New User

![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/register`

**Description:**  
Register a new user.

**Request Body:**
```json
{
  "account": "string",   // The account currently logged in.
  "cookie": "string",    // The cookie which server provides.
  "user": "string",      // The new user's ID.
  "pwd": "string",       // The new user's password.
  "mail": "string",      // The new user's email. (Must end with @eucan.com.tw)
  "name": "string",      // The new user's name.
  "date": "YYYY-MM-DD",  // Join date. (Optional, defaults to creation date)
  "type": "string",      // Account type. (Optional, defaults to "employee")
  "mgroup": "0 or 1",      // Manager group.
  "permit": true         // Permission to take a day off. (Optional, defaults to true)
}
```

**Response:**
- **200 OK**: User successfully registered.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error

---

## 4. Get All Users

![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/users`

**Description:**  
Retrieve all users.

**Request Body:**
```json
{
  "account": "string",   // The account currently logged in.
  "cookie": "string"     // The cookie which server provides.
}
```

**Response:**
- **200 OK**: Returns a list of users.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error

---

## 5. Add a New Dayoff Request

![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/request`

**Description:**  
Add a new dayoff request.

**Request Body:**
```json
{
  "account": "string",        // The account currently logged in.
  "cookie": "string",         // The cookie which server provides.
  "type": "string",           // The dayoff type.
  "reason": "string",         // The reason for taking a day off.
  "start": "YYYY-MM-DD HH:mm",// Start datetime.
  "end": "YYYY-MM-DD HH:mm"   // End datetime.
}
```

**Response:**
- **200 OK**: Dayoff request successfully added.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error

---

## 6. View Approved Dayoff Requests

![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/approved`

**Description:**  
Show all **approved** dayoff requests.

**Request Body:**
```json
{
  "account": "string",   // The account currently logged in.
  "cookie": "string"     // The cookie which server provides.
}
```

**Response:**
- **200 OK**: Returns a list of approved dayoff requests.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error

---

## 7. View Employee Dayoff Record

![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/dayoff`

**Description:**  
**Under Development.**  
View an employee's dayoff record.

**Request Body:**
```json
{
  "account": "string",   // The account currently logged in.
  "cookie": "string",    // The cookie which server provides.
  "user": "string",      // The user whose record is to be looked up.
  "year": "YYYY"         // The year to search for.
}
```

**Response:**
- **200 OK**: Returns the dayoff record.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error

---

## 8. Permit or Deny a Request

![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/permit`

**Description:**  
Accept or deny a dayoff request.

**Request Body:**
```json
{
  "account": "string",   // The account currently logged in.
  "cookie": "string",    // The cookie which server provides.
  "num": "integer",      // The serial number of the request.
  "permit": 1            // 1 for approval, 0 or undefined for denial.
}
```

**Response:**
- **200 OK**: Request status updated.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error

---

## 9. Query Pending Requests

![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/query`

**Description:**  
Show all requests that haven't been reviewed yet.

**Request Body:**
```json
{
  "account": "string",   // The account currently logged in.
  "cookie": "string"     // The cookie which server provides.
}
```

**Response:**
- **200 OK**: Returns a list of pending requests.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error

---

## 10. Check Session Validity

![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/session`

**Description:**  
**Deprecated.**  
Check if the cookie is valid.

**Request Body:**
```json
{
  "account": "string",   // The account currently logged in.
  "cookie": "string"     // The cookie which server provides.
}
```

**Response:**
- **200 OK**: Session is valid.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error

---

## 11. Fetch Non-Working Day

![GET](https://img.shields.io/badge/GET-0052CC?style=flat-square&logo=appveyor&logoColor=white) `/api/{YEAR}`

**Description:**  
{YEAR}: The year to lookup. (Can be AD Year or ROC Year)
Get all Non-working day and working day, where non-working days have 1 as its value, and working days have 0.

**Request Body:**
```json
{
  "account": "string",   // The account currently logged in.
  "cookie": "string"     // The cookie which server provides.
}
```
**Response:**
- **200 OK**: Server is online.
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: No permission
- **500 Internal server error**: Internal server error, usually that file haven't been publish by GOV.

### Noted that this function might take a second since it will try to download the file if it wasn't exist.
---