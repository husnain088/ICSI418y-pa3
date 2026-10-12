require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGO_URI);
let users;
let projects;
let memberships;

async function connectDatabase() {
  await client.connect();

  const db = client.db("pa2");
  users = db.collection("users");
  projects = db.collection("Projects");
  memberships = db.collection("ProjectMemberships");

  await users.createIndex({ username: 1 }, { unique: true });

  console.log("Connected to MongoDB");
}

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.post("/signup", async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    if (
      typeof f_name !== "string" ||
      typeof l_name !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      !f_name.trim() ||
      !l_name.trim() ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please provide first name, last name, username, and password.",
      });
    }

    const cleanUser = {
      f_name: f_name.trim(),
      l_name: l_name.trim(),
      username: username.trim(),
      password,
    };

    const existingUser = await users.findOne({
      username: cleanUser.username,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    await users.insertOne(cleanUser);

    return res.status(201).json({
      message: "User created successfully.",
    });
  } catch (error) {
    console.error("Signup error:", error);

    // The unique index also protects against two signup requests
    // arriving at nearly the same time.
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error. Please try again.",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter your username and password.",
      });
    }

    const foundUser = await users.findOne({
      username: username.trim(),
    });

    if (!foundUser || foundUser.password !== password) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    return res.status(200).json({
      message: "Login successful.",
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error. Please try again.",
    });
  }
});

async function startServer() {
  try {
    await connectDatabase();
    
    // Get registered users for project leads and memberships
app.get("/api/users", async (req, res) => {
  try {
    const registeredUsers = await users
      .find({}, { projection: { _id: 1, username: 1 } })
      .toArray();

    return res.status(200).json(registeredUsers);
  } catch (error) {
    console.error("Could not retrieve users:", error);

    return res.status(500).json({
      message: "Could not retrieve registered users"
    });
  }
});
// Create a project and add its lead as a member
app.post("/api/projects", async (req, res) => {
  try {
    const { name, description, status, project_lead_id } = req.body;

    // Check required fields
    if (
      typeof name !== "string" || !name.trim() ||
      typeof description !== "string" || !description.trim() ||
      typeof status !== "string" || !status.trim() ||
      typeof project_lead_id !== "string" || !project_lead_id.trim()
    ) {
      return res.status(400).json({
        message: "Name, description, status, and project lead are required"
      });
    }

    // Check the allowed status values
    const validStatuses = ["Planning", "Active", "Completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be Planning, Active, or Completed"
      });
    }

    // Validate the ID before converting it
    if (!ObjectId.isValid(project_lead_id)) {
      return res.status(400).json({
        message: "Invalid project lead ID"
      });
    }

    const leadId = new ObjectId(project_lead_id);

    // Verify that the selected lead exists
    const lead = await users.findOne({ _id: leadId });

    if (!lead) {
      return res.status(404).json({
        message: "Selected project lead does not exist"
      });
    }

    const project = {
      name: name.trim(),
      description: description.trim(),
      status: status,
      project_lead_id: leadId
    };

    const result = await projects.insertOne(project);

    // Automatically add the lead as a member
    try {
      await memberships.insertOne({
        project_id: result.insertedId,
        user_id: leadId
      });
    } catch (error) {
      // Undo creation if the lead's membership could not be saved
      await projects.deleteOne({ _id: result.insertedId });
      throw error;
    }

    return res.status(201).json({
      message: "Project created successfully",
      project_id: result.insertedId
    });
  } catch (error) {
    console.error("Could not create project:", error);

    return res.status(500).json({
      message: "Could not create project. Please try again"
    });
  }
});
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB.");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
