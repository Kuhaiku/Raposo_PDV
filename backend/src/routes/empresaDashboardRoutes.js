const express = require('express');
const router = express.Router();
const empresaDashboardController = require('../controllers/empresaDashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Rota exclusiva para administradores.' });
    }
    next();
};

router.get('/', authMiddleware, isAdmin, empresaDashboardController.getDashboardData);

module.exports = router;