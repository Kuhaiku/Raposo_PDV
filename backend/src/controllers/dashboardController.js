const pool = require('../config/database');

exports.obterMetricas = async (req, res) => {
    const empresa_id = req.empresaId; // Obtém o ID da empresa do token de autenticação
    try {
        // 1. Novos clientes no mês (últimos 30 dias)
        const [novosClientesResult] = await pool.query(
            "SELECT COUNT(id) AS novosClientes FROM clientes WHERE criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND empresa_id = ?",
            [empresa_id]
        );

        // 2. Total de faturamento no mês atual
        const [faturamentoMesResult] = await pool.query(
            "SELECT IFNULL(SUM(valor_total), 0) AS faturamentoMes FROM vendas WHERE MONTH(data_venda) = MONTH(NOW()) AND YEAR(data_venda) = YEAR(NOW()) AND empresa_id = ?",
            [empresa_id]
        );

        // 3. Gráfico de QUANTIDADE de vendas diárias no mês atual
        const [vendasPorDiaResult] = await pool.query(`
            SELECT 
                DAY(data_venda) AS dia, 
                COUNT(id) AS quantidade
            FROM vendas
            WHERE MONTH(data_venda) = MONTH(NOW()) AND YEAR(data_venda) = YEAR(NOW()) AND empresa_id = ?
            GROUP BY DAY(data_venda)
            ORDER BY dia ASC
        `, [empresa_id]);

        // 4. NOVO: Gráfico de VALOR (R$) faturado por dia no mês atual
        const [faturamentoPorDiaResult] = await pool.query(`
            SELECT 
                DAY(data_venda) AS dia, 
                SUM(valor_total) AS total
            FROM vendas
            WHERE MONTH(data_venda) = MONTH(NOW()) AND YEAR(data_venda) = YEAR(NOW()) AND empresa_id = ?
            GROUP BY DAY(data_venda)
            ORDER BY dia ASC
        `, [empresa_id]);

        // Monta o objeto final com todos os dados
        const metricas = {
            novosClientes: novosClientesResult[0].novosClientes || 0,
            faturamentoMes: faturamentoMesResult[0].faturamentoMes,
            vendasPorDia: vendasPorDiaResult,
            faturamentoPorDia: faturamentoPorDiaResult
        };

        res.status(200).json(metricas);
    } catch (error) {
        console.error("Erro no dashboardController:", error);
        res.status(500).json({ message: 'Erro ao buscar métricas do dashboard.' });
    }
};
