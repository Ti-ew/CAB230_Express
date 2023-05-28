const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../../knexfile').development);

router.get('/', (req, res) => {
    knex.select('*')
        .from('basics')
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
