const pool = require('../config/database');

exports.getDashboardData = async (req, res) => {
    const { empresaId } = req;
    const { periodo = 'mes' } = req.query;

    try {
        let dateFilter = '';
        switch (periodo) {
            case 'hoje':
                dateFilter = 'AND DATE(data_venda) = CURDATE()';
                break;
            case 'semana':
                dateFilter = 'AND YEARWEEK(data_venda, 1) = YEARWEEK(CURDATE(), 1)';
                break;
            case 'ano':
                dateFilter = 'AND YEAR(data_venda) = YEAR(CURDATE())';
                break;
            case 'mes':
            default:
                dateFilter = 'AND MONTH(data_venda) = MONTH(CURDATE()) AND YEAR(data_venda) = YEAR(CURDATE())';
                break;
        }

        const metricsQuery = `
            SELECT
                IFNULL(SUM(valor_total), 0) AS vendasTotais,
                COUNT(id) AS numeroPedidos,
                IFNULL(AVG(valor_total), 0) AS ticketMedio
            FROM vendas
            WHERE empresa_id = ? ${dateFilter}
        `;
        const [metricsResult] = await pool.query(metricsQuery, [empresaId]);

        const topVendedoresQuery = `
            SELECT u.nome, IFNULL(SUM(v.valor_total), 0) AS totalVendido
            FROM vendas v
            JOIN usuarios u ON v.usuario_id = u.id
            WHERE v.empresa_id = ? ${dateFilter}
            GROUP BY u.id, u.nome
            ORDER BY totalVendido DESC
            LIMIT 3;
        `;
        const [topVendedores] = await pool.query(topVendedoresQuery, [empresaId]);

        const metaMensal = 80000;
        const progressoMeta = (metricsResult[0].vendasTotais / metaMensal) * 100;

        res.status(200).json({
            vendasTotais: parseFloat(metricsResult[0].vendasTotais),
            numeroPedidos: parseInt(metricsResult[0].numeroPedidos),
            ticketMedio: parseFloat(metricsResult[0].ticketMedio),
            metaMensal: metaMensal,
            progressoMeta: progressoMeta > 100 ? 100 : progressoMeta,
            topVendedores: topVendedores
        });

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard da empresa:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar dados do painel.' });
    }
};