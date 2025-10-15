const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Função para o ADMIN cadastrar um novo FUNCIONÁRIO
exports.cadastrarFuncionario = async (req, res) => {
    // O ID da empresa vem do token do admin logado
    const { empresaId } = req;
    const { nome, email, telefone, cpf, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Nome, e-mail and senha são obrigatórios.' });
    }

    try {
        // Criptografa a senha provisória definida pelo admin
        const senhaHash = await bcrypt.hash(senha, 10);

        // Insere o novo usuário com a role 'funcionario'
        await pool.query(
            'INSERT INTO usuarios (empresa_id, nome, email, senha_hash, role) VALUES (?, ?, ?, ?, ?)',
            [empresaId, nome, email, senhaHash, 'funcionario']
        );

        res.status(201).json({ message: 'Funcionário cadastrado com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao cadastrar funcionário.' });
    }
};
// Adicione esta função ao final do arquivo usuarioController.js

exports.fecharPeriodo = async (req, res) => {
    const { usuarioId, empresaId } = req; // IDs vêm do token
    const { senha } = req.body;

    if (!senha) {
        return res.status(400).json({ message: 'A senha é obrigatória para fechar o período.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Verifica a senha do usuário
        const [userRows] = await connection.query('SELECT senha_hash, data_inicio_periodo_atual FROM usuarios WHERE id = ?', [usuarioId]);
        const usuario = userRows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            await connection.rollback();
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        // 2. Calcula as métricas do período atual
        const metricsQuery = `
            SELECT IFNULL(SUM(valor_total), 0) AS totalVendas, COUNT(id) AS numeroVendas
            FROM vendas
            WHERE usuario_id = ? AND data_venda >= ?
        `;
        const [metricsResult] = await connection.query(metricsQuery, [usuarioId, usuario.data_inicio_periodo_atual]);
        const { totalVendas, numeroVendas } = metricsResult[0];
        const comissao = parseFloat(totalVendas) * 0.15; // Usando 15% como exemplo

        // 3. Salva o período na tabela de histórico
        await connection.query(
            'INSERT INTO periodos_fechados (empresa_id, usuario_id, data_inicio, data_fim, total_faturado, numero_vendas, comissao_gerada) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
            [empresaId, usuarioId, usuario.data_inicio_periodo_atual, totalVendas, numeroVendas, comissao]
        );

        // 4. Atualiza a data de início do período do usuário para o momento atual
        await connection.query('UPDATE usuarios SET data_inicio_periodo_atual = NOW() WHERE id = ?', [usuarioId]);

        await connection.commit();
        res.status(200).json({ message: 'Período fechado com sucesso!' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Erro ao fechar período:", error);
        res.status(500).json({ message: 'Erro no servidor ao fechar o período.' });
    } finally {
        if (connection) connection.release();
    }
};