const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../data/pacientes.json');

// ponytail: lemos do disco em cada requisição para não perder atualizações e salvamos com writeFileSync. Sem necessidade de banco de dados por enquanto.
router.get('/paciente', (req, res) => {
    const { prontuario } = req.query;
    if (!prontuario) return res.status(400).json({ erro: 'Prontuário obrigatório' });
    const pacientes = JSON.parse(fs.readFileSync(file, 'utf8'));
    const paciente = pacientes.find(p => p.prontuario_id === prontuario);
    if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado' });
    res.json(paciente);
});

router.post('/paciente', (req, res) => {
    const pacientes = JSON.parse(fs.readFileSync(file, 'utf8'));
    pacientes.push(req.body);
    fs.writeFileSync(file, JSON.stringify(pacientes, null, 2));
    res.status(201).json(req.body);
});

router.put('/paciente/:id', (req, res) => {
    const pacientes = JSON.parse(fs.readFileSync(file, 'utf8'));
    const idx = pacientes.findIndex(p => p.prontuario_id === req.params.id);
    if (idx === -1) return res.status(404).json({ erro: 'Paciente não encontrado' });
    pacientes[idx] = { ...pacientes[idx], ...req.body };
    fs.writeFileSync(file, JSON.stringify(pacientes, null, 2));
    res.json(pacientes[idx]);
});

module.exports = router;