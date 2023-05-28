const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../../knexfile").development);

router.get("/:id", (req, res) => {
  const { id } = req.params;

  knex
    .select("*")
    .from("movies.names")
    .where("nconst", id)
    .then((data) => {
      if (data.length === 0) {
        res.status(404).json({ error: "Person not found" });
      } else {
        res.status(200).json(data[0]);
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;
