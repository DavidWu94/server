# database setup
userinfo for storing account and password:
`CREATE TABLE userinfo (id TEXT PRIMARY KEY,pwd TEXT NOT NULL,type TEXT DEFAULT employee);`
logininfo for storing session key:
`CREATE TABLE logininfo (id TEXT NOT NULL,sKey TEXT PRIMARY KEY,createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
<!-- forget password db:
`CREATE TABLE logininfo (id TEXT PRIMARY KEY,createTime DATETIME DEFAULT datetime('now','+1 hour'))` -->
---
# account setup

for admin account registering:
`INSERT INTO userinfo (id,pwd,type) VALUES ('010049','test123','admin');`

for employee account registering:
`INSERT INTO userinfo (id,pwd) VALUES ('010049','test123');`