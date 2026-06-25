const router = require('express').Router();
const pacientes = require('../data/pacientes.json');

router.get('/paciente', (req, res) => {
    const { prontuario } = req.query;
    if (!prontuario) return res.status(400).json({ erro: 'Prontuário obrigatório' });
    const paciente = pacientes.find(p => p.prontuario_id === prontuario);
    if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado' });
    res.json(paciente);
});

module.exports = router;