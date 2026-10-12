require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGO_URI);
let users;

async function connectDatabase() {
  await client.connect();

  const db = client.db("pa2");
  users = db.collection("users");

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
