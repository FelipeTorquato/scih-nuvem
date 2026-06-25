const express = require('express');
const app = express();
app.use(express.json());

app.use('/real', require('./src/routes/real'));
app.use('/integrasus', require('./src/routes/integrasus'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 3000);