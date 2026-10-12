# ICSI 418Y – Programming Assignment 2: Login and Signup

For this assignment I built a login and signup application using React, Express, and MongoDB. The React frontend sends requests to an Express backend, and the backend stores and checks users in a MongoDB Atlas database.

```
React (localhost:5173)  →  HTTP requests  →  Express (localhost:9000)  →  MongoDB Atlas
```

## What I Built

- A Signup form that creates a new user (first name, last name, username, password)
- A Login form that checks a username and password against the database
- A tab switch so the user can move between Login and Signup without a routing library
- Messages in the interface that tell the user whether an action worked, so the browser console is never needed
- A backend duplicate-username check so two users cannot share a username

## How I Set It Up

**Frontend.** I created the React app with Vite (React, JavaScript) inside the `client` folder and ran it with `npm run dev`.

**Backend.** I created a `server` folder, ran `npm init -y`, and installed `express`, `mongodb`, `cors`, and `dotenv`. I started with a small Express server and a test route at `/` to confirm it was running on port 9000.

**Database.** I created a free MongoDB Atlas cluster, made a database user, and added my IP address under Network Access. I copied the connection string into a `.env` file as `MONGO_URI` and loaded it with `dotenv` so my credentials are not written in my code. I confirmed the connection by printing "Connected to MongoDB" when the server starts.

**Git.** I added a `.gitignore` at the root so `node_modules` and `server/.env` are never committed.

## Project Structure

```
icsi418y-pa2/
├── .gitignore
├── README.md
├── client/
│   └── src/
│       ├── components/
│       │   ├── Login.jsx      Login form and request
│       │   └── Signup.jsx     Signup form and request
│       ├── App.jsx            Switches between Login and Signup
│       ├── App.css / index.css
│       └── main.jsx
└── server/
    ├── server.js              Express routes and MongoDB connection
    └── .env                   Not committed
```

## How I Built the Frontend

**Components.** I made `Signup.jsx` and `Login.jsx` as separate components and imported them into `App.jsx`. `App.jsx` keeps one piece of state, `activeTab`, and shows either form based on it.

**Form data.** Each input is connected to React state with `useState`, using `value` and `onChange`, so React always knows what the user typed. I also keep a `message` and a `status` in state so I can show green or red feedback.

**Sending requests.** In `handleSubmit` I call `event.preventDefault()` and use `fetch()` to POST the data as JSON to `http://localhost:9000/signup` or `/login`. I read the reply with `response.json()` and check `response.ok` to tell success from failure.

**Handling errors.** I handle two different failures. If the server replies with an error, I show its message. If the server cannot be reached at all, `fetch` throws, and my `try/catch` shows "Could not connect to the server".

**Extra touches.** Inputs are trimmed before sending, the submit button is disabled while a request is running, and the fields are cleared after a successful signup or login.

## How I Built the Backend

The server uses `express.json()` so it can read JSON bodies and `cors()` so React can talk to it. After connecting, I select the `pa2` database and the `users` collection.

**`POST /signup`**
1. Check that all required fields exist, otherwise return `400`.
2. Use `findOne()` to look for an existing username. If one exists, return `409`.
3. Use `insertOne()` to save the user and return `201`.

**`POST /login`**
1. Check that the username and password exist, otherwise return `400`.
2. Use `findOne()` to find the user.
3. If the user is not found or the password does not match, return `401`. I use the same message for both cases so the response does not reveal which usernames exist.
4. Otherwise return `200`.

Both routes are wrapped in `try/catch`. If something goes wrong with the database, the server logs the real error and sends back only a generic `500` message, so internal details are never exposed to the frontend.

I also created a unique index on `username`. The `findOne()` check is the main duplicate protection, and the index acts as a second safeguard if two signups arrive at nearly the same moment.

## Status Codes I Used

| Status | Used for |
| --- | --- |
| `200` | Login successful |
| `201` | User created |
| `400` | Missing required information |
| `401` | Invalid login credentials |
| `409` | Username already exists |
| `500` | Server or database error |

## How to Run It

You need two terminals.

**Server**
```bash
cd server
npm install
```
Create `server/.env` containing:
```
MONGO_URI=your_mongodb_connection_string
```
Then run:
```bash
node server.js
```
You should see `Connected to MongoDB` and `Server running on port 9000`.

**Client**
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173`.

## How I Tested It

I tested after each step instead of building everything at once:

1. Signed up with a new user and saw the success message.
2. Opened MongoDB Atlas (`pa2` → `users`) and confirmed the document was saved.
3. Signed up with the same username and got "Username already exists".
4. Logged in with the correct credentials and got a success message.
5. Logged in with a wrong password and got "Invalid username or password".
6. Submitted empty fields to check the validation messages.
7. Stopped the server to confirm the frontend shows "Could not connect to the server".

## Notes

- Passwords are stored as plain text because this assignment does not require hashing. In a real application I would hash them with something like `bcrypt`.
- `cors()` is open to all origins, which is fine for local development only.
- My `.env` file is not in the repository because it contains my database credentials.