const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../../knexfile").development);

// GET /movies/search
router.get('/search', (req, res) => {
    knex
      .select('*')
      .from('movies.basics')
      .orderBy('tconst', 'asc')
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

router.get("/data/:imdbID", (req, res) => {
  const { imdbID } = req.params;

  knex
    .select("*")
    .from("movies.basics")
    .where("tconst", imdbID)
    .then((data) => {
      if (data.length === 0) {
        res.status(404).json({ error: "Movie not found" });
      } else {
        res.status(200).json(data[0]);
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;
