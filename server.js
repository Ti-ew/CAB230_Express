// Import necessary modules
const express = require("express");
const app = express();
const port = 3000;

// Import routes
const moviesRoutes = require("./api/routes/moviesRoutes");

// Use routes
app.use("/movies", moviesRoutes);

// (Optional) Routes
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
