const router = require('express').Router();
// const laudos = require('../data/laudos.json');
const path = require('path');

router.get('/laudos/:prontuario', (req, res) => {
    res.sendFile(path.join(__dirname, '../../r.e.a.l_exemplo.pdf'));
});

router.get('/laudos', (req, res) => {
    res.sendFile(path.join(__dirname, '../../r.e.a.l_exemplo.pdf'));
});

module.exports = router;