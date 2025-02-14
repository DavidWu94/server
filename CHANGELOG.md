# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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