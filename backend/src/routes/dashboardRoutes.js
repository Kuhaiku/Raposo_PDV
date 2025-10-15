const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protege a rota: apenas usuários logados (qualquer role) podem acessar
router.get('/funcionario', authMiddleware, dashboardController.getFuncionarioDashboardData);

module.exports = router;