require("dotenv").config({ path: "variables.env" });

// Import necessary modules
const express = require("express");
const app = express();
const port = 3000;
// Import user controller

// Import routes
const userRoutes = require("./api/routes/userRoutes");
const moviesRoutes = require("./api/routes/moviesRoutes");
const peopleRoutes = require("./api/routes/peopleRoutes");
app.use(express.json()); // Body parser middleware
// Use routes
app.use("/user", userRoutes);
app.use("/movies", moviesRoutes);
app.use("/people", peopleRoutes);
// Register endpoint

// (Optional) Routes
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
