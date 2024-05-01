# database setup
userinfo for storing account and password:

`CREATE TABLE userinfo (id TEXT PRIMARY KEY,pwd TEXT NOT NULL,type TEXT DEFAULT employee,email TEXT NOT NULL,name TEXT NOT NULL);`

logininfo for storing session key:

`CREATE TABLE logininfo (id TEXT NOT NULL,sKey TEXT PRIMARY KEY,createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
<!-- forget password db:
`CREATE TABLE logininfo (id TEXT PRIMARY KEY,createTime DATETIME DEFAULT datetime('now','+1 hour'))` -->
---
# account setup

for admin account registering:

`INSERT INTO userinfo (id,pwd,type,email,name) VALUES ('010049','test123','admin','something@mail.com','黃阿明');`


for employee account registering:

`INSERT INTO userinfo (id,pwd,email,name) VALUES ('010049','test123','test@mail.com','丁一二');`