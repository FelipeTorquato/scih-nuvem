const router = require('express').Router();
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/pacientes.json');
const relatorioXls = path.join(__dirname, '../data/relatorio_permanencia_Exemplo_Mock.xls');

function enviarArquivo(res, next, filePath, contentType, disposition, filename) {
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ erro: 'Arquivo não encontrado' });
    }
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
    res.setHeader('X-Scih-Competencia', filename);
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(filePath, { cacheControl: false }, (err) => {
        if (err) next(err);
    });
}

router.get(['/relatorio-permanencia', '/planilha'], (req, res, next) => {
    enviarArquivo(
        res,
        next,
        relatorioXls,
        'application/vnd.ms-excel',
        'attachment',
        'relatorio_permanencia_Exemplo_Mock.xls'
    );
});

// shortcut: leitura/escrita síncrona em JSON no disco por requisição; migrar para banco se houver concorrência.
router.get('/paciente', (req, res) => {
    const { prontuario } = req.query;
    if (!prontuario) return res.status(400).json({ erro: 'Prontuário obrigatório' });
    const pacientes = JSON.parse(fs.readFileSync(file, 'utf8'));
    const paciente = pacientes.find(p => p.prontuario_id === prontuario);
    if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado' });
    res.json(paciente);
});

router.post('/paciente', (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length === 0) {
        return res.status(400).json({ erro: 'Corpo JSON inválido' });
    }
    const pacientes = JSON.parse(fs.readFileSync(file, 'utf8'));
    pacientes.push(req.body);
    fs.writeFileSync(file, JSON.stringify(pacientes, null, 2));
    res.status(201).json(req.body);
});

router.put('/paciente/:id', (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({ erro: 'Corpo JSON inválido' });
    }
    const pacientes = JSON.parse(fs.readFileSync(file, 'utf8'));
    const idx = pacientes.findIndex(p => p.prontuario_id === req.params.id);
    if (idx === -1) return res.status(404).json({ erro: 'Paciente não encontrado' });
    pacientes[idx] = { ...pacientes[idx], ...req.body };
    fs.writeFileSync(file, JSON.stringify(pacientes, null, 2));
    res.json(pacientes[idx]);
});

module.exports = router;
