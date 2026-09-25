const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../data/laudos.json');

router.get('/laudos/:prontuario', (req, res) => {
    res.sendFile(path.join(__dirname, '../../r.e.a.l_exemplo-1.pdf'));
});

router.get('/laudos', (req, res) => {
    res.sendFile(path.join(__dirname, '../../r.e.a.l_exemplo-1.pdf'));
});

router.post('/laudos', (req, res) => {
    const laudos = JSON.parse(fs.readFileSync(file, 'utf8'));
    laudos.push(req.body);
    fs.writeFileSync(file, JSON.stringify(laudos, null, 2));
    res.status(201).json(req.body);
});

router.put('/laudos/:prontuario', (req, res) => {
    const laudos = JSON.parse(fs.readFileSync(file, 'utf8'));
    const idx = laudos.findIndex(l => l.prontuario_id === req.params.prontuario);
    if (idx === -1) return res.status(404).json({ erro: 'Laudo não encontrado' });
    laudos[idx] = { ...laudos[idx], ...req.body };
    fs.writeFileSync(file, JSON.stringify(laudos, null, 2));
    res.json(laudos[idx]);
});

module.exports = router;