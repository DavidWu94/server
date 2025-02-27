# database setup
userinfo for storing account and password:

`CREATE TABLE userinfo (id TEXT PRIMARY KEY,pwd TEXT NOT NULL,type TEXT DEFAULT employee,email TEXT NOT NULL,name TEXT NOT NULL,joinTime DATETIME DEFAULT (strftime('%Y-%m-%d', 'now', '+8 hours')), mgroup INT NOT NULL,permit INT DEFAULT 1);`
<!-- dayoff permit requirement: 1 = requeire permission, 0 = no requeirement -->

logininfo for storing session key:

`CREATE TABLE logininfo (id TEXT NOT NULL,sKey TEXT PRIMARY KEY,createTime DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours')));`

workinginfo for sign in

`CREATE TABLE workinginfo (serialnum INT PRIMARY KEY,id TEXT NOT NULL,type INT NOT NULL,year DATETIME DEFAULT (strftime('%Y', 'now', '+8 hours')),month DATETIME DEFAULT (strftime('%m', 'now', '+8 hours')),time DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M', 'now', '+8 hours')));`

dayoffinfo

`CREATE TABLE dayoffinfo (id TEXT NOT NULL,annual FLOAT DEFAULT 0,personal FLOAT DEFAULT 0,care FLOAT DEFAULT 0,sick FLOAT DEFAULT 0,wedding FLOAT DEFAULT 0,funeral FLOAT DEFAULT 0,birth FLOAT DEFAULT 0,pcheckup FLOAT DEFAULT 0,miscarriage FLOAT DEFAULT 0,paternity FLOAT DEFAULT 0,maternity FLOAT DEFAULT 0,other FLOAT DEFAULT 0,total FLOAT DEFAULT 0,year DATETIME DEFAULT (strftime('%Y', 'now', '+8 hours')));`

requestquery

`CREATE TABLE requestquery (serialnum TEXT PRIMARY KEY,id TEXT NOT NULL,name TEXT NOT NULL,type TEXT NOT NULL,start DATETIME NOT NULL,end DATETIME NOT NULL,mgroup INT NOT NULL,state INT DEFAULT 0,year DATETIME DEFAULT (strftime('%Y', 'now', '+8 hours')),month DATETIME DEFAULT (strftime('%m', 'now', '+8 hours')),totalTime FLOAT NOT NULL,reason TEXT NOT NULL);`

(state 0 = Havent permitted, 1 = Accepted, -1 = Rejected)

clockinrecord

`CREATE TABLE clockinrecord (id TEXT NOT NULL,name TEXT NOT NULL,date DATETIME DEFAULT (strftime('%Y-%m-%d', 'now', '+8 hours')),num INT DEFAULT 1,clockin DATETIME,clockout DATETIME);`

<!-- forget password db:
`CREATE TABLE logininfo (id TEXT PRIMARY KEY,createTime DATETIME DEFAULT datetime('now','+1 hour'))` -->
---
# account setup

for admin account registering:
<!-- FIXME -->
`INSERT INTO userinfo (id,pwd,type,email,name,mgroup,permit) VALUES ('010049','test123','admin','something@mail.com','黃阿明',0,0);`


for employee account registering:
<!-- FIXME -->
`INSERT INTO userinfo (id,pwd,email,name,mgroup,permit) VALUES ('010049','test123','test@mail.com','丁一二',1,1);`

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [branch] YYYY-MM-DD

### Added
- Added 1
- Added 2

### Changed
- Changed 1
- Changed 2

### Deprecated
- Deprecated 1
- Deprecated 2

### Removed
- Removed 1
- Removed 2

### Fixed
- Fixed 1
- Fixed 2

### Security
- Security 1
- Security 2