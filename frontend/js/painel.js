document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // --- Elementos do DOM (existentes) ---
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');
    const vendasTotaisEl = document.getElementById('vendas-totais');
    const comissaoEl = document.getElementById('comissao');
    const ticketMedioEl = document.getElementById('ticket-medio');
    const vendasPeriodoTotalEl = document.getElementById('vendas-periodo-total');
    const periodoLabelEl = document.getElementById('periodo-label');
    const salesChartEl = document.getElementById('sales-chart');
    const periodoFilters = document.getElementById('periodo-filters');

    // --- NOVO: Elementos do Modal ---
    const btnAbrirModal = document.getElementById('btn-abrir-modal-fechar');
    const modal = document.getElementById('modal-fechar-periodo');
    const formFecharPeriodo = document.getElementById('form-fechar-periodo');
    const btnCancelarFechamento = document.getElementById('btn-cancelar-fechamento');
    const modalErrorMessage = document.getElementById('modal-error-message');

    // ... (funções formatCurrency, loadDashboardData, renderChart existentes) ...
    const payload = getTokenPayload();
    if(payload && payload.nome){welcomeMessage.textContent=`Olá, ${payload.nome.split(' ')[0]}!`}
    const formatCurrency=(value)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    async function loadDashboardData(periodo='hoje'){try{const response=await fetchWithAuth(`/api/dashboard/funcionario?periodo=${periodo}`);const data=await response.json();vendasTotaisEl.textContent=formatCurrency(data.vendasTotais);comissaoEl.textContent=formatCurrency(data.comissao);ticketMedioEl.textContent=formatCurrency(data.ticketMedio);vendasPeriodoTotalEl.textContent=formatCurrency(data.vendasTotais);const filterButton=periodoFilters.querySelector(`[data-periodo="${periodo}"]`);periodoLabelEl.textContent=filterButton.textContent;renderChart(data.vendasPorHora)}catch(error){console.error('Falha ao carregar dados do painel:',error)}}
    function renderChart(data){salesChartEl.innerHTML='';const maxValue=Math.max(...data.map(item=>item.valor),1);data.forEach(item=>{const barHeight=(item.valor/maxValue)*100;const bar=`<div class="flex flex-col items-center gap-2 w-full h-full justify-end"><div class="bg-primary/30 w-full rounded-t-md" style="height: ${barHeight}%;"></div><p class="text-gray-500 text-xs font-bold">${item.hora}</p></div>`;salesChartEl.insertAdjacentHTML('beforeend',bar)})}

    // --- Lógica para o Modal ---
    btnAbrirModal.addEventListener('click', () => {
        modal.classList.remove('hidden');
        document.getElementById('senha-confirmacao').value = '';
        modalErrorMessage.textContent = '';
    });

    btnCancelarFechamento.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    formFecharPeriodo.addEventListener('submit', async (e) => {
        e.preventDefault();
        modalErrorMessage.textContent = '';
        const senha = document.getElementById('senha-confirmacao').value;

        try {
            const response = await fetchWithAuth('/api/usuarios/fechar-periodo', {
                method: 'POST',
                body: JSON.stringify({ senha })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            alert('Período fechado com sucesso!');
            modal.classList.add('hidden');
            loadDashboardData('hoje'); // Recarrega os dados do painel

        } catch (error) {
            modalErrorMessage.textContent = error.message;
        }
    });

    // --- Event Listeners existentes ---
    periodoFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            periodoFilters.querySelectorAll('.btn-periodo').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            loadDashboardData(e.target.dataset.periodo);
        }
    });

    logoutButton.addEventListener('click', logout);

    // Carga inicial
    loadDashboardData('hoje');
});