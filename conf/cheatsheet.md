# database setup
userinfo for storing account and password:

`CREATE TABLE userinfo (id TEXT PRIMARY KEY,pwd TEXT NOT NULL,type TEXT DEFAULT employee,email TEXT NOT NULL,name TEXT NOT NULL,joinTime DATETIME DEFAULT (strftime('%Y-%m-%d', 'now', '+8 hours')),totalSpDayOff INT DEFAULT 0,usedSpDayOff INT DEFAULT 0, otherDayOff INT DEFAULT 0, mgroup INT NOT NULL);`

logininfo for storing session key:

`CREATE TABLE logininfo (id TEXT NOT NULL,sKey TEXT PRIMARY KEY,createTime DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours')));`
<!-- forget password db:
`CREATE TABLE logininfo (id TEXT PRIMARY KEY,createTime DATETIME DEFAULT datetime('now','+1 hour'))` -->
---
# account setup

for admin account registering:
<!-- FIXME -->
`INSERT INTO userinfo (id,pwd,type,email,name,mgroup) VALUES ('010049','test123','admin','something@mail.com','黃阿明',0);`


for employee account registering:
<!-- FIXME -->
`INSERT INTO userinfo (id,pwd,email,name,mgroup) VALUES ('010049','test123','test@mail.com','丁一二',1);`