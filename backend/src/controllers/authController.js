const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cadastro da empresa e do seu usuário administrador
exports.cadastrar = async (req, res) => {
    const { nome_empresa, nome_usuario, email, senha } = req.body;
    if (!nome_empresa || !nome_usuario || !email || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Criar a empresa
        const slug = nome_empresa.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const [empresaResult] = await connection.query(
            'INSERT INTO empresas (nome, slug) VALUES (?, ?)',
            [nome_empresa, slug]
        );
        const empresaId = empresaResult.insertId;

        // 2. Criar o usuário administrador
        const senhaHash = await bcrypt.hash(senha, 10);
        await connection.query(
            'INSERT INTO usuarios (empresa_id, nome, email, senha_hash, role) VALUES (?, ?, ?, ?, ?)',
            [empresaId, nome_usuario, email, senhaHash, 'admin']
        );

        await connection.commit();
        res.status(201).json({ message: 'Empresa e usuário administrador cadastrados com sucesso!' });
    } catch (error) {
        if (connection) await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao realizar o cadastro.' });
    } finally {
        if (connection) connection.release();
    }
};

// Login unificado
exports.login = async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT u.*, e.ativo AS empresa_ativa FROM usuarios u JOIN empresas e ON u.empresa_id = e.id WHERE u.email = ?',
            [email]
        );
        const usuario = rows[0];

        if (!usuario) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        if (!usuario.empresa_ativa) {
             return res.status(403).json({ message: 'A empresa associada a este usuário está inativa.' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            {
                usuarioId: usuario.id,
                empresaId: usuario.empresa_id,
                nome: usuario.nome,
                role: usuario.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login bem-sucedido!',
            token: token,
            role: usuario.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor durante o login.' });
    }
};