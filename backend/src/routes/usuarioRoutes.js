const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware para garantir que apenas o admin da empresa acesse
const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    next();
};

// Rota para cadastrar um novo funcionário
// A rota é protegida para garantir que apenas um admin logado possa usá-la
router.post('/cadastrar', authMiddleware, isAdmin, usuarioController.cadastrarFuncionario);
router.post('/fechar-periodo', authMiddleware, usuarioController.fecharPeriodo);

module.exports = router;