const pool = require('../config/database');

exports.getFuncionarioDashboardData = async (req, res) => {
    // O usuarioId é extraído do token de autenticação pelo middleware
    const { usuarioId } = req;
    const { periodo = 'hoje' } = req.query; // Filtro de período: 'hoje', 'semana', 'mes'

    try {
        let dateFilter = '';
        if (periodo === 'hoje') {
            dateFilter = 'AND DATE(data_venda) = CURDATE()';
        } else if (periodo === 'semana') {
            dateFilter = 'AND YEARWEEK(data_venda, 1) = YEARWEEK(CURDATE(), 1)';
        } else if (periodo === 'mes') {
            dateFilter = 'AND MONTH(data_venda) = MONTH(CURDATE()) AND YEAR(data_venda) = YEAR(CURDATE())';
        }

        const query = `
            SELECT
                IFNULL(SUM(valor_total), 0) AS totalVendas,
                COUNT(id) AS numeroVendas,
                IFNULL(AVG(valor_total), 0) AS ticketMedio
            FROM vendas
            WHERE usuario_id = ? ${dateFilter}
        `;

        const [rows] = await pool.query(query, [usuarioId]);
        const data = rows[0];
        
        // Simulação de dados do gráfico por hora
        const vendasPorHora = [
            { hora: '08h', valor: Math.random() * 50 },
            { hora: '10h', valor: Math.random() * 100 },
            { hora: '12h', valor: Math.random() * 150 },
            { hora: '14h', valor: Math.random() * 120 },
            { hora: '16h', valor: Math.random() * 80 },
            { hora: '18h', valor: Math.random() * 30 },
        ];

        res.status(200).json({
            vendasTotais: parseFloat(data.totalVendas),
            comissao: parseFloat(data.totalVendas) * 0.15, // Exemplo comissão de 15%
            ticketMedio: parseFloat(data.ticketMedio),
            vendasPorHora: vendasPorHora
        });

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard do funcionário:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};