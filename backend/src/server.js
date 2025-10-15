const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importação de todas as nossas rotas
const authRoutes = require('./routes/authRoutes');
const empresaDashboardRoutes = require('./routes/empresaDashboardRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ROTAS DA API ---
app.use('/api/auth', authRoutes);
app.use('/api/dashboard/empresa', empresaDashboardRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- SERVIR O FRONTEND ---
const frontendPath = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath));

// --- ROTA DE CAPTURA (Catch-all) ---
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});