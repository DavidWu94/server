# database setup
userinfo for storing account and password:

`CREATE TABLE userinfo (id TEXT PRIMARY KEY,pwd TEXT NOT NULL,type TEXT DEFAULT employee,email TEXT NOT NULL,name TEXT NOT NULL,joinTime DATETIME DEFAULT (strftime('%Y-%m-%d', 'now', '+8 hours')), mgroup INT NOT NULL,permit INT DEFAULT 1);`

logininfo for storing session key:

`CREATE TABLE logininfo (id TEXT NOT NULL,sKey TEXT PRIMARY KEY,createTime DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours')));`

workinginfo for sign in

`CREATE TABLE workinginfo (serialnum INT PRIMARY KEY,id TEXT NOT NULL,type INT NOT NULL,year DATETIME DEFAULT (strftime('%Y', 'now', '+8 hours')),month DATETIME DEFAULT (strftime('%m', 'now', '+8 hours')),time DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M', 'now', '+8 hours')));`

dayoffinfo

`CREATE TABLE dayoffinfo (id TEXT NOT NULL,annual INT DEFAULT 0,personal INT DEFAULT 0,care INT DEFAULT 0,sick INT DEFAULT 0,wedding INT DEFAULT 0,funeral INT DEFAULT 0,birth INT DEFAULT 0,pcheckup INT DEFAULT 0,miscarriage INT DEFAULT 0,paternity INT DEFAULT 0,maternity INT DEFAULT 0,other INT DEFAULT 0,total INT DEFAULT 0,year DATETIME DEFAULT (strftime('%Y', 'now', '+8 hours')));`

requestquery

`CREATE TABLE requestquery (serialnum TEXT PRIMARY KEY,id TEXT NOT NULL,type TEXT NOT NULL,start DATETIME NOT NULL,end DATETIME NOT NULL,mgroup INT NOT NULL,state INT DEFAULT 0,year DATETIME DEFAULT (strftime('%Y', 'now', '+8 hours')));`

(state 0 = Havent permitted, 1 = Accepted, -1 = Rejected)

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