# CodeCraftHub

Personal learning goal tracker API built with Node.js and Express.

CodeCraftHub allows developers to create, view, update, and delete courses they want to learn. Course data is stored locally in a `courses.json` file, so no database is required.

## Features

- Create new learning courses
- View all courses
- View an individual course
- Update existing courses
- Delete courses
- Automatically generated numeric course IDs
- Automatically generated creation timestamps
- Course status validation
- Target date validation using the `YYYY-MM-DD` format
- Automatic creation of `courses.json`
- JSON file-based data storage
- RESTful API endpoints
- Error handling for invalid requests and file operations

## Course Fields

Each course contains the following fields:



|
Field
|
Type
|
Required
|
Description
|
|
---
|
---
|
---:
|
---
|
|
`id`
|
Number
|
Automatically generated
|
Unique course ID starting from
`1`
|
|
`name`
|
String
|
Yes
|
Name of the course
|
|
`description`
|
String
|
Yes
|
Description of the course
|
|
`target_date`
|
String
|
Yes
|
Target completion date in
`YYYY-MM-DD`
format
|
|
`status`
|
String
|
Yes
|
`Not Started`
,
`In Progress`
, or
`Completed`
|
|
`created_at`
|
String
|
Automatically generated
|
ISO timestamp showing when the course was created
|

## Project Structure

```text
codecrafthub/
├── app.js
├── package.json
└── courses.json
The
courses.json
file is created automatically when the application starts if it does not already exist.
Installation
1. Clone or create the project
Create a project directory and move into it:
mkdir codecrafthub
cd codecrafthub
2. Initialize the Node.js project
If
package.json
does not already exist, run:
npm init -y
3. Install dependencies
Install Express:
npm install express
4. Add the application files
Make sure the project contains:
app.js
package.json
The application will create
courses.json
automatically.
How to Run the Application
Start the server with:
npm start
The API runs on port
5000
:
http://localhost:5000
You can also start the application directly with Node.js:
node app.js
API Documentation
Base URL
http://localhost:5000/api

Create a Course
Request
POST /api/courses
Example using cURL
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Learn REST APIs",
    "description": "Study HTTP methods, REST principles, and Express routing.",
    "target_date": "2026-12-31",
    "status": "Not Started"
  }'
Example response
{
  "id": 1,
  "name": "Learn REST APIs",
  "description": "Study HTTP methods, REST principles, and Express routing.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-09-01T12:00:00.000Z"
}
The
id
and
created_at
fields are generated automatically.

Get All Courses
Request
GET /api/courses
Example using cURL
curl http://localhost:5000/api/courses
Example response
[
  {
    "id": 1,
    "name": "Learn REST APIs",
    "description": "Study HTTP methods, REST principles, and Express routing.",
    "target_date": "2026-12-31",
    "status": "Not Started",
    "created_at": "2026-09-01T12:00:00.000Z"
  }
]

Get a Specific Course
Request
GET /api/courses/:id
Replace
:id
with the course ID.
Example using cURL
curl http://localhost:5000/api/courses/1
Example response
{
  "id": 1,
  "name": "Learn REST APIs",
  "description": "Study HTTP methods, REST principles, and Express routing.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-09-01T12:00:00.000Z"
}
Course not found response
{
  "error": "Course not found"
}

Update a Course
Request
PUT /api/courses/:id
The request must include all required course fields.
Example using cURL
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced REST APIs",
    "description": "Build advanced REST APIs with Node.js and Express.",
    "target_date": "2027-01-31",
    "status": "In Progress"
  }'
Example response
{
  "id": 1,
  "name": "Advanced REST APIs",
  "description": "Build advanced REST APIs with Node.js and Express.",
  "target_date": "2027-01-31",
  "status": "In Progress",
  "created_at": "2026-09-01T12:00:00.000Z"
}
The original
id
and
created_at
values are preserved.

Delete a Course
Request
DELETE /api/courses/:id
Example using cURL
curl -X DELETE http://localhost:5000/api/courses/1
Example response
{
  "message": "Course deleted successfully",
  "course": {
    "id": 1,
    "name": "Advanced REST APIs",
    "description": "Build advanced REST APIs with Node.js and Express.",
    "target_date": "2027-01-31",
    "status": "In Progress",
    "created_at": "2026-09-01T12:00:00.000Z"
  }
}
Validation Rules
Required fields
The following fields are required when creating or updating a course:
name
description
target_date
status
Valid statuses
The
status
field must be one of:
Not Started
In Progress
Completed
Valid target date
The
target_date
must use this format:
YYYY-MM-DD
Example:
2026-12-31
Example validation error
{
  "error": "Invalid course data",
  "details": [
    "name is required",
    "status must be one of: Not Started, In Progress, Completed"
  ]
}
Data Storage
Course data is stored in the local
courses.json
file.
Example:
[
  {
    "id": 1,
    "name": "Learn Node.js",
    "description": "Learn the fundamentals of Node.js.",
    "target_date": "2026-10-15",
    "status": "In Progress",
    "created_at": "2026-09-01T12:00:00.000Z"
  }
]
The application reads the file when retrieving or modifying courses and writes the updated course list back to the file.
This file-based approach is useful for learning and small projects. It is not recommended for production applications with many users or simultaneous requests.
Troubleshooting
npm: command not found
Node.js is not installed or is not available in your system's PATH.
Install Node.js from:
https://nodejs.org/
Then verify the installation:
node --version
npm --version
Cannot find module 'express'
Install the project dependencies:
npm install
If necessary, install Express directly:
npm install express
npm start
does not work
Check that
package.json
contains this script:
{
  "scripts": {
    "start": "node app.js"
  }
}
Also confirm that
app.js
is in the project root directory.
Port 5000 is already in use
Another application may already be using port
5000
.
Stop the other application, or change the port in
app.js
:
const PORT = 5001;
Then restart the server.
Invalid JSON request
Make sure requests containing JSON include this header:
Content-Type: application/json
Also verify that the request body contains valid JSON.
Correct:
{
  "name": "Learn Express",
  "description": "Learn Express fundamentals.",
  "target_date": "2026-11-30",
  "status": "Not Started"
}
courses.json
is missing
The application should create
courses.json
automatically when it starts.
If needed, create the file manually in the same directory as
app.js
with this content:
[]
courses.json
contains invalid JSON
If the file was edited incorrectly, replace its contents with:
[]
This resets the course list and removes existing course data.
Course not found
Check that the course ID exists:
curl http://localhost:5000/api/courses
Then use an ID returned by that request:
curl http://localhost:5000/api/courses/1
License
This project is intended for learning and educational purposes.
