const createError = require('http-errors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

const laudoPdf = path.join(__dirname, 'r.e.a.l_exemplo-1.pdf');
const reporteXlsx = path.join(__dirname, 'src/data/Reporte_Exemplo_Mock.xlsx');
const relatorioXls = path.join(__dirname, 'src/data/relatorio_permanencia_Exemplo_Mock.xls');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/real', require('./src/routes/real'));
app.use('/integrasus', require('./src/routes/integrasus'));
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    arquivos: {
      pdf: fs.existsSync(laudoPdf),
      reporteXlsx: fs.existsSync(reporteXlsx),
      relatorioPermanenciaXls: fs.existsSync(relatorioXls)
    }
  });
});

app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
  if (req.originalUrl && (req.originalUrl.startsWith('/real') || req.originalUrl.startsWith('/integrasus'))) {
    return res.status(err.status || 500).json({ erro: err.message });
  }
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
