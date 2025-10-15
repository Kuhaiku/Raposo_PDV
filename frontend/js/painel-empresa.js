document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário é 'admin' antes de carregar a página
    checkAuth('admin');

    const logoutButton = document.getElementById('logout-button');
    const periodoFilters = document.getElementById('periodo-filters');
    const vendasTotaisEl = document.getElementById('vendas-totais');
    const numeroPedidosEl = document.getElementById('numero-pedidos');
    const ticketMedioEl = document.getElementById('ticket-medio');
    const metaMesEl = document.getElementById('meta-mes');
    const progressoPercentualEl = document.getElementById('progresso-percentual');
    const progressoBarraEl = document.getElementById('progresso-barra');
    const topVendedoresList = document.getElementById('top-vendedores-list');

    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    async function loadDashboardData(periodo = 'mes') {
        try {
            const response = await fetchWithAuth(`/api/dashboard/empresa?periodo=${periodo}`);
            if (!response.ok) throw new Error('Falha ao carregar dados');
            const data = await response.json();

            vendasTotaisEl.textContent = formatCurrency(data.vendasTotais);
            numeroPedidosEl.textContent = data.numeroPedidos;
            ticketMedioEl.textContent = formatCurrency(data.ticketMedio);
            metaMesEl.textContent = formatCurrency(data.metaMensal);
            progressoPercentualEl.textContent = `${data.progressoMeta.toFixed(1)}%`;
            progressoBarraEl.style.width = `${data.progressoMeta}%`;

            topVendedoresList.innerHTML = '';
            if (data.topVendedores.length > 0) {
                data.topVendedores.forEach((vendedor, index) => {
                    const item = `
                        <div class="flex items-center p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                            <span class="text-lg font-bold text-gray-500 w-6">${index + 1}</span>
                            <div class="flex-1 mx-3">
                                <p class="font-medium">${vendedor.nome}</p>
                                <p class="text-sm text-gray-500">${formatCurrency(vendedor.totalVendido)}</p>
                            </div>
                        </div>`;
                    topVendedoresList.insertAdjacentHTML('beforeend', item);
                });
            } else {
                topVendedoresList.innerHTML = '<p class="text-center text-gray-500">Nenhuma venda registrada no período.</p>';
            }
        } catch (error) {
            console.error(error);
            topVendedoresList.innerHTML = '<p class="text-center text-red-500">Erro ao carregar dados.</p>';
        }
    }

    periodoFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            periodoFilters.querySelectorAll('.btn-periodo').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            loadDashboardData(e.target.dataset.periodo);
        }
    });
    
    logoutButton.addEventListener('click', logout);

    loadDashboardData('mes');
});