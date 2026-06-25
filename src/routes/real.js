const router = require('express').Router();
const laudos = require('../data/laudos.json');

// Lista todos os laudos positivos (com filtro opcional por data)
router.get('/laudos', (req, res) => {
    const {data_coleta} = req.query;
    const resultado = data_coleta
        ? laudos.filter(l => l.data_coleta === data_coleta)
        : laudos;
    res.json(resultado);
});

// Busca laudo por prontuário
router.get('/laudos/:prontuario', (req, res) => {
    const laudo = laudos.find(l => l.prontuario_id === req.params.prontuario);
    if (!laudo) return res.status(404).json({erro: 'Laudo não encontrado'});
    res.json(laudo);
});

module.exports = router;