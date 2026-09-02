// Import the required packages
const express = require("express");
const fs = require("fs").promises;
const path = require("path");

// Create the Express application
const app = express();

// The server will run on port 5000
const PORT = 5000;

// Store courses.json in the same folder as app.js
const DATA_FILE = path.join(__dirname, "courses.json");

// Allowed course status values
const ALLOWED_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed"
];

// Middleware that allows Express to read JSON request bodies
app.use(express.json());

/*
  Create courses.json automatically if it does not exist.

  The file starts with an empty array because all courses
  will be stored inside a JSON array.
*/
async function ensureDataFileExists() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // If the file does not exist, create it
    if (error.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, "[]", "utf8");
      console.log("Created courses.json");
    } else {
      // Pass other file system errors to the error handler
      throw error;
    }
  }
}

/*
  Read courses from courses.json.

  The JSON text is converted into a JavaScript array
  using JSON.parse().
*/
async function readCourses() {
  try {
    await ensureDataFileExists();

    const fileContents = await fs.readFile(DATA_FILE, "utf8");

    // If the file is empty, treat it as an empty array
    if (!fileContents.trim()) {
      return [];
    }

    return JSON.parse(fileContents);
  } catch (error) {
    // JSON.parse errors and file read errors are handled by routes
    throw new Error(`Unable to read courses.json: ${error.message}`);
  }
}

/*
  Write courses to courses.json.

  JSON.stringify() converts the JavaScript array into
  formatted JSON text.
*/
async function writeCourses(courses) {
  try {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(courses, null, 2),
      "utf8"
    );
  } catch (error) {
    throw new Error(`Unable to write courses.json: ${error.message}`);
  }
}

/*
  Check whether a date is valid and uses the YYYY-MM-DD format.

  Examples:
  Valid:   2026-12-31
  Invalid: 31-12-2026
*/
function isValidDateFormat(dateString) {
  if (typeof dateString !== "string") {
    return false;
  }

  // First check the exact YYYY-MM-DD pattern
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  // Create a UTC date to check whether the date actually exists
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/*
  Validate the data sent by the client.

  This function checks all required fields:
  - name
  - description
  - target_date
  - status
*/
function validateCourseData(courseData) {
  const errors = [];

  if (
    !courseData.name ||
    typeof courseData.name !== "string" ||
    courseData.name.trim() === ""
  ) {
    errors.push("name is required");
  }

  if (
    !courseData.description ||
    typeof courseData.description !== "string" ||
    courseData.description.trim() === ""
  ) {
    errors.push("description is required");
  }

  if (
    !courseData.target_date ||
    !isValidDateFormat(courseData.target_date)
  ) {
    errors.push("target_date is required and must use YYYY-MM-DD format");
  }

  if (!courseData.status) {
    errors.push("status is required");
  } else if (!ALLOWED_STATUSES.includes(courseData.status)) {
    errors.push(
      `status must be one of: ${ALLOWED_STATUSES.join(", ")}`
    );
  }

  return errors;
}

/*
  GET /api/courses

  Return all courses.
*/
app.get("/api/courses", async (req, res, next) => {
  try {
    const courses = await readCourses();

    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
});

/*
  GET /api/courses/:id

  Return one course based on its numeric ID.
*/
app.get("/api/courses/:id", async (req, res, next) => {
  try {
    const courses = await readCourses();

    const courseId = Number(req.params.id);

    const course = courses.find((item) => item.id === courseId);

    if (!course) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
});

/*
  POST /api/courses

  Add a new course.
*/
app.post("/api/courses", async (req, res, next) => {
  try {
    const errors = validateCourseData(req.body);

    // Return a 400 Bad Request response if validation fails
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Invalid course data",
        details: errors
      });
    }

    const courses = await readCourses();

    /*
      Generate an ID automatically.

      The first course receives ID 1.
      Later courses receive the highest existing ID plus 1.
      This prevents IDs from being reused after deletion.
    */
    const highestId = courses.reduce((highest, course) => {
      return Math.max(highest, course.id);
    }, 0);

    const newCourse = {
      id: highestId + 1,
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: new Date().toISOString()
    };

    courses.push(newCourse);

    await writeCourses(courses);

    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
});

/*
  PUT /api/courses/:id

  Replace all editable information for an existing course.

  The ID and created_at timestamp are preserved.
*/
app.put("/api/courses/:id", async (req, res, next) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({
        error: "No data provided"
    });
    }

    if (
    data.target_date !== undefined &&
    !isValidDateFormat(data.target_date)
    ) {
    return res.status(400).json({
        error: "target_date must use YYYY-MM-DD format"
    });
    }

    if (
    data.status !== undefined &&
    !ALLOWED_STATUSES.includes(data.status)
    ) {
    return res.status(400).json({
        error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`
    });
    }

    const courses = await readCourses();
    const courseId = Number(req.params.id);

    const courseIndex = courses.findIndex(
      (course) => course.id === courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    const existingCourse = courses[courseIndex];

    const updatedCourse = {
    ...existingCourse,
    ...(data.name !== undefined && { name: data.name.trim() }),
    ...(data.description !== undefined && {
        description: data.description.trim()
    }),
    ...(data.target_date !== undefined && {
        target_date: data.target_date
    }),
    ...(data.status !== undefined && {
        status: data.status
    })
    };

    courses[courseIndex] = updatedCourse;

    await writeCourses(courses);

    res.status(200).json(updatedCourse);
  } catch (error) {
    next(error);
  }
});

/*
  DELETE /api/courses/:id

  Delete a course based on its ID.
*/
app.delete("/api/courses/:id", async (req, res, next) => {
  try {
    const courses = await readCourses();
    const courseId = Number(req.params.id);

    const courseIndex = courses.findIndex(
      (course) => course.id === courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    // Remove one course from the array
    const deletedCourse = courses.splice(courseIndex, 1)[0];

    await writeCourses(courses);

    res.status(200).json({
      message: "Course deleted successfully",
      course: deletedCourse
    });
  } catch (error) {
    next(error);
  }
});

/*
  Handle unknown routes.

  This runs when a client requests an endpoint that does not exist.
*/
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

/*
  Global error-handling middleware.

  This catches:
  - File read errors
  - File write errors
  - Invalid JSON file errors
  - Other unexpected server errors
*/
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    error: "Internal server error",
    message: error.message
  });
});

/*
  Make sure courses.json exists before starting the server.
*/
ensureDataFileExists()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `CodeCraftHub API is running at http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("Could not start the server:", error.message);
    process.exit(1);
  });
