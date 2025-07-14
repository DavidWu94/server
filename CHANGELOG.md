# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.3.1] 2025-06-23

### Changed
- clockout after 18:00 will always be 18:00

### Security
- Check for XSS and SQL injection

## [1.3.0] 2025-06-23

### Added
- Official dayoff type
- Modification method of dayoff reason

## [1.2.3] 2025-04-22

### Changed
- Monitor action will not be logged.

---
## [1.2.2] 2025-04-22

### Changed
- font size of dayoff calendar.
- removed spaces between two datetime.

---
## [1.2.1] 2025-03-28

### Changed
- checkWorkingDay now auto download files.

### Fixed
- clock-in check working day's month added 1.
- /approve typo

---
## [1.2.0] 2025-03-19

### Changed
- /approved now accept month parameter.
- /quota now returns join time.

---
## [1.1.0] 2025-03-19

### Changed
- Employees can only do clockin/clockout from 08:30 to 18:00.
- Calendars is displayed in a different format.
- Calendars' cell height is now dynamic.

---
## [1.0.4] 2025-03-05

### Security
- Typo of account type is fixed.

---
## [1.0.3] 2025-03-03

### Changed
- Some log messages.

### Fixed
- /request's logic.
- TypeError of the cookie and password in /login

---
## [1.0.2] 2025-02-27

### Changed
- clockininfo structor changed.

### Fixed
- Req,Res is sent in wrong order. (Changed the order in all system files.)
- request of dayoff logic error.

---
## [1.0.1] 2025-02-26

### Fixed
- Req,Res is sent in wrong order.

---
## [1.0.0] 2025-02-26

### Changed
- The program is now written in ts.

### Fixed
- Modify ticket's language problem.

---
## [Beta 0.6.2] 2025-02-21

### Fixed
- 'year' in /quota will be sent to sqlPlugin.

---
## [Beta 0.6.1] 2025-02-20

### Fixed
- 'year' can now be received by /quota.

---
## [Beta 0.6.0] 2025-02-19

### Added
- Method to modify tickets.

### Changed
- The way to create serial number in request query.

---
## [Beta 0.5.3] 2025-02-14

### Changed
- /calendar and /clrecord wont send files, just go check google drive.

### Fixed
- Clockin record's output.

---
## [Beta 0.5.2] 2025-02-14

### Changed
- How year works in request query.

---
## [Beta 0.5.1] 2025-02-13

### Changed
- clockinrecord's format

---
## [Beta 0.5.0] 2025-02-13

### Added
- /sync can reset dayoff time base on tickets.

### Fixed
- setPermit's logic on init a dayoffinfo.

### Changed
- /calendar and /clrecord is under maintainance.

---
## [Beta 0.4.2] 2025-02-11

### Fixed
- /register have some issues with the permission setting.

---
## [Beta 0.4.1] 2025-02-10

### Fixed
- Some dayoff request should be accepted upon its creation.

---
## [Beta 0.4.0] 2025-02-10

### Fixed
- /login can't login if the cookie is null

### Changed
- The structor of the system

### Removed
- run.sh

---
## [Alpha 0.3.4] 2025-02-10

### Fixed
- /quota's returned hours changes from 24hrs/day to 8hrs/day

### Security
- Added SQL injection detection for hash checking and login.

---
## [Alpha 0.3.3] 2025-02-09

### Changed
- /calendar now uses async function. Require further tests.

---
## [Alpha 0.3.2] 2025-02-09

### Added
- log message while sending calendar file.

### Fixed
- /dayoff searching method now only accept admin users.

### Security
- /clockin will only accept "day" parameter when you are using search method.

---
## [Alpha 0.3.1] 2025-02-05

### Changed
- /calendar will now force download the file.
- /empquery now returns state.

---
## [Alpha 0.3.0] 2025-02-02

### Added
- dayoff_calendar create method.

---
## [Alpha 0.2.4] 2025-02-02

### Added
- Column "month" to requestquery.

### Changed
- dayoffinfo now auto detect the year of the ticket when a new request is made.

---
## [Alpha 0.2.3] 2025-01-31

### Changed
- /quota now returns annual quota in hours, not in days.

---
## [Alpha 0.2.2] 2025-01-30

### Changed
- Fixed the bug that clockin searching only returns 1 record.
- /quota also returns the seniority of the employee.

---
## [Alpha 0.2.1] 2025-01-27

### Added
- Period '.' to all lines in CHANGELOG. (Yap, this also requires a CHANGLOG.)
- Some operations will triggers logger to log messages.

### Changed
- Log files' name format.

---
## [Alpha 0.2.0] 2025-01-27

### Added
- Endpoint to Clock-in and Clock-out.
- Endpoint to serach a user's annual dayoff quota.

### Changed
- Dockerfile to correct timezone.

---
## [Alpha 0.1.0] 2025-01-25

### Added
- Dayoff record for employee's side.
- Method of deleting userinfo.
- Dayoff hour modification method.

### Changed
- /approved can now search via year and user, it can also add limits.

---
## [Alpha 0.0.1] 2025-01-02

### Added
- Web scraper to download JSON file from the gov.
- A api method to request for the JSON file.

### Changed
- Fixed cookie refresh.

### Deprecated
- Upload page and multer page.