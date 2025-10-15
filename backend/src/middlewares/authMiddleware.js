const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
        return res.status(401).json({ message: 'Token com formato inválido.' });
    }

    const [, token] = parts;

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido ou expirado.' });
        }

        // Adiciona os dados do token na requisição para uso posterior
        req.usuarioId = decoded.usuarioId;
        req.empresaId = decoded.empresaId;
        req.userRole = decoded.role;
        next();
    });
};