## API Documentation

---

### 1. Check Server Status

**Endpoint:**
![GET](https://img.shields.io/badge/GET-0052CC?style=flat-square&logo=appveyor&logoColor=white) `/session`

**Description:**  
Check if the server is online.

**Request:**
```http
GET /session
```

**Response:**
- **200 OK**: Server is online.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

---

### 2. Login

**Endpoint:**
![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/login`

**Description:**  
Login to the system.

**Request Body:**
```json
{
  "account": "string",   // User account.
  "pwd": "string",       // User password.
  "twoFA": "string"      // Optional two-factor authentication (only for root account).
}
```

**Response:**
- **200 OK**: Successful login.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission or invalid credentials.

---

### 3. Register a New User

**Endpoint:**
![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/register`

**Description:**  
Register a new user.

**Request Body:**
```json
{
  "account": "string",   // Admin account.
  "cookie": "string",    // Session cookie.
  "user": "string",      // New user's ID.
  "pwd": "string",       // New user's password.
  "mail": "string",      // New user's email.
  "name": "string",      // New user's name.
  "date": "YYYY-MM-DD",  // Join date (optional).
  "type": "string",      // Account type (optional, defaults to "employee").
  "mgroup": "0 or 1",    // Manager group.
  "permit": true           // Permission to take a day off (optional).
}
```

**Response:**
- **200 OK**: User registered successfully.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

---

### 4. Retrieve All Users

**Endpoint:**
![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/users`

**Description:**  
Retrieve a list of all users (admin-only).

**Request Body:**
```json
{
  "account": "string",   // Admin account.
  "cookie": "string"     // Session cookie.
}
```

**Response:**
- **200 OK**: Returns the list of users.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

---

### 5. Delete a User

**Endpoint:**
![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/delete`

**Description:**  
Delete a user account.

**Request Body:**
```json
{
  "account": "string",   // Admin account.
  "cookie": "string",    // Session cookie.
  "user": "string"       // User ID to delete.
}
```

**Response:**
- **200 OK**: User deleted successfully.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

---

### 6. Add a New Dayoff Request

**Endpoint:**
![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/request`

**Description:**  
Submit a new dayoff request.

**Request Body:**
```json
{
  "account": "string",        // User account.
  "cookie": "string",         // Session cookie.
  "type": "string",           // Dayoff type.
  "reason": "string",         // Reason for dayoff.
  "start": "YYYY-MM-DD HH:mm",// Start datetime.
  "end": "YYYY-MM-DD HH:mm"   // End datetime.
}
```

**Response:**
- **200 OK**: Dayoff request submitted successfully.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

---

### 7. View Approved Dayoff Requests

**Endpoint:**
![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/approved`

**Description:**  
View all approved dayoff requests.

**Request Body:**
```json
{
  "account": "string",   // User account.
  "cookie": "string",    // Session cookie.
  "user":"string",       // The employee to lookup.(optional)
  "year":"string",       // The year to lookup.(optional)
  "limit":"integer"      // The limit of the amount to retrive.(optional)
}
```

**Response:**
- **200 OK**: Returns approved requests.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

---

### 8. View Employee Dayoff Records

**Endpoint:**
![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/dayoff`

**Description:**  
View an employee's dayoff record.

**Request Body:**
```json
{
  "account": "string",   // User account.
  "cookie": "string",    // Session cookie.
  "user": "string",      // Target user ID (optional).
  "year": "YYYY"         // Year to search for.
}
```

**Response:**
- **200 OK**: Returns dayoff records.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

---

### 9. Permit or Deny Dayoff Requests

**Endpoint:**
![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/permit`

**Description:**  
Approve or deny a dayoff request.

**Request Body:**
```json
{
  "account": "string",   // Admin account.
  "cookie": "string",    // Session cookie.
  "num": "integer",      // Request ID.
  "permit": 1             // 1 to approve, 0 to deny.
}
```

**Response:**
- **200 OK**: Request updated successfully.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

---

### 10. Query Pending Requests

**Endpoint:**
![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/query`

**Description:**  
Retrieve all unreviewed requests.

**Request Body:**
```json
{
  "account": "string",   // Admin account.
  "cookie": "string"     // Session cookie.
}
```

**Response:**
- **200 OK**: Returns pending requests.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

---

### 11. Fetch Non-Working Days

**Endpoint:**
![GET](https://img.shields.io/badge/GET-0052CC?style=flat-square&logo=appveyor&logoColor=white) `/api/{YEAR}`

**Description:**  
Retrieve non-working and working days for the specified year.

**Request Body:**
```json
{
  "account": "string",   // User account.
  "cookie": "string"     // Session cookie.
}
```

**Response:**
- **200 OK**: Returns non-working day data.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

---

### 12. Modify User Data

**Endpoint:**
![POST](https://img.shields.io/badge/POST-FF4136?style=flat-square&logo=appveyor&logoColor=white) `/modify`

**Description:**  
Modify an existing user’s data.

**Request Body:**
```json
{
  "account": "string",   // Admin account.
  "cookie": "string",    // Session cookie.
  "user": "string",      // User ID to modify.
  "year": "string",      // Year of modification.
  "data": "object"       // Data to update.
}
```

**Response:**
- **200 OK**: User data updated successfully.
- **400 Bad Request**: Invalid input data.
- **403 Forbidden**: No permission.

