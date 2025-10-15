checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    const produtosTableBody = document.getElementById('produtos-table-body');
    const addProdutoForm = document.getElementById('add-produto-form');
    const successMessageDiv = document.getElementById('success-message');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-produto-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const verCatalogoBtn = document.getElementById('ver-catalogo-btn');
    const importCsvBtn = document.getElementById('import-csv-btn');
    const csvFileInput = document.getElementById('csv-file');
    const downloadCsvTemplateBtn = document.getElementById('download-csv-template-btn');
    const btnOrdenacao = document.getElementById('btn-ordenacao');
    const textoOrdenacao = document.getElementById('texto-ordenacao');

    // CAMPOS DOS GERENCIADORES DE FOTOS
    const addFileInput = document.getElementById('imagem');
    const addPreviewsContainer = document.getElementById('add-previews');
    const editFileInput = document.getElementById('edit-imagem');
    const editPreviewsContainer = document.getElementById('edit-previews');
    let fotosParaRemover = [];

    // LÓGICA DO INPUT CSV
    const csvFileNameSpan = document.getElementById('csv-file-name');
    csvFileInput.addEventListener('change', () => {
        if (csvFileInput.files.length > 0) {
            csvFileNameSpan.textContent = csvFileInput.files[0].name;
            csvFileNameSpan.style.fontStyle = 'normal';
        } else {
            csvFileNameSpan.textContent = 'Nenhum arquivo selecionado';
            csvFileNameSpan.style.fontStyle = 'italic';
        }
    });

    const selecionarTodosCheck = document.getElementById('selecionar-todos');
    const inativarMassaBtn = document.getElementById('inativar-massa-btn');
    const excluirMassaBtn = document.getElementById('excluir-massa-btn');

    const estadosOrdenacao = [
        { id: 'nome-asc', texto: 'Ordem Alfabética', icone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1 25.9 17-41z"/></svg>` },
        { id: 'preco-desc', texto: 'Maior Preço', icone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"/></svg>` },
        { id: 'preco-asc', texto: 'Menor Preço', icone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"/></svg>` },
        { id: 'id-desc', texto: 'Mais Recentes', icone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M96 32V64H48C21.5 64 0 85.5 0 112v48H448V112c0-26.5-21.5-48-48-48H352V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H160V32c0-17.7-14.3-32-32-32S96 14.3 96 32zM448 192H0V464c0 26.5 21.5 48 48 48H400c26.5 0 48-21.5 48-48V192zM224 340c-6.8 0-13.3 1.6-19.2 4.6l-48 24c-11.2 5.6-15.3 19.3-9.8 30.5s19.3 15.3 30.5 9.8l26-13V424c0 13.3 10.7 24 24 24s24-10.7 24-24V381.5l26 13c11.2 5.6 24.9 1.5 30.5-9.8s1.5-24.9-9.8-30.5l-48-24c-5.9-3-12.4-4.6-19.2-4.6z"/></svg>` },
        { id: 'id-asc', texto: 'Mais Antigos', icone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M96 32V64H48C21.5 64 0 85.5 0 112v48H448V112c0-26.5-21.5-48-48-48H352V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H160V32c0-17.7-14.3-32-32-32S96 14.3 96 32zM448 192H0V464c0 26.5 21.5 48 48 48H400c26.5 0 48-21.5 48-48V192zM224 276c-6.8 0-13.3-1.6-19.2-4.6l-48-24c-11.2-5.6-15.3-19.3-9.8-30.5s19.3-15.3 30.5-9.8l26 13V200c0-13.3 10.7 24 24 24s24 10.7 24-24v20.5l26-13c11.2-5.6 24.9-1.5 30.5 9.8s1.5 24.9-9.8 30.5l-48 24c-5.9 3-12.4 4.6-19.2 4.6z"/></svg>` },
    ];
    let indiceOrdenacaoAtual = 0;

    function criarPreview(file, container) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'foto-preview';
            div.innerHTML = `<img src="${e.target.result}" alt="${file.name}"><button type="button" class="btn-remover-foto" title="Remover esta imagem">&times;</button>`;
            container.appendChild(div);
            div.querySelector('.btn-remover-foto').addEventListener('click', () => div.remove());
        };
        reader.readAsDataURL(file);
    }

    addFileInput.addEventListener('change', (event) => {
        addPreviewsContainer.innerHTML = '';
        for (const file of event.target.files) {
            criarPreview(file, addPreviewsContainer);
        }
    });

    editFileInput.addEventListener('change', (event) => {
        for (const file of event.target.files) {
            criarPreview(file, editPreviewsContainer);
        }
    });

    function atualizarBotaoOrdenacao() {
        const estado = estadosOrdenacao[indiceOrdenacaoAtual];
        btnOrdenacao.innerHTML = estado.icone;
        textoOrdenacao.textContent = estado.texto;
        btnOrdenacao.title = `Ordenar por: ${estado.texto}`;
    }
    
    function obterIdsSelecionados() {
        const checkboxes = produtosTableBody.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.closest('tr').dataset.produtoId));
    }

    async function carregarProdutos() {
        try {
            const ordenacaoAtualId = estadosOrdenacao[indiceOrdenacaoAtual].id;
            const response = await fetchWithAuth(`/api/produtos?sortBy=${ordenacaoAtualId}`);
            if (!response.ok) throw new Error('Erro ao buscar produtos.');

            const produtos = await response.json();
            produtosTableBody.innerHTML = '';

            produtos.forEach(produto => {
                const tr = document.createElement('tr');
                tr.dataset.produtoId = produto.id;
                tr.innerHTML = `
                    <td><input type="checkbox" class="produto-checkbox" data-id="${produto.id}"></td>
                    <td><img src="${produto.foto_url || 'img/placeholder.png'}" alt="${produto.nome}" class="produto-img"></td>
                    <td>${produto.codigo || 'N/A'}</td>
                    <td>${produto.nome}</td>
                    <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                    <td>${produto.estoque}</td>
                    <td>
                        <button class="btn-action btn-edit">Editar</button>
                        <button class="btn-action btn-delete">Inativar</button>
                    </td>
                `;
                produtosTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error.message);
            alert('Não foi possível carregar a lista de produtos.');
        }
    }

    btnOrdenacao.addEventListener('click', () => {
        indiceOrdenacaoAtual = (indiceOrdenacaoAtual + 1) % estadosOrdenacao.length;
        atualizarBotaoOrdenacao();
        carregarProdutos();
    });

    async function configurarLinkCatalogo() {
        try {
            const response = await fetchWithAuth('/api/empresas/meus-dados');
            if (!response.ok) {
                verCatalogoBtn.style.display = 'none';
                return;
            }
            const data = await response.json();
            if (data.slug) {
                verCatalogoBtn.href = `catalogo.html?empresa=${data.slug}`;
            } else {
                verCatalogoBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao buscar slug da empresa:', error);
            verCatalogoBtn.style.display = 'none';
        }
    }

    addProdutoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(addProdutoForm);
        try {
            const response = await fetchWithAuth('/api/produtos', { method: 'POST', body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            addProdutoForm.reset();
            addPreviewsContainer.innerHTML = '';
            successMessageDiv.textContent = 'Produto salvo com sucesso!';
            setTimeout(() => { successMessageDiv.textContent = ''; }, 3000);
            carregarProdutos();
        } catch (error) {
            alert(error.message);
        }
    });

    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('edit-produto-id').value;
        const formData = new FormData();

        formData.append('nome', document.getElementById('edit-nome').value);
        formData.append('codigo', document.getElementById('edit-codigo').value);
        formData.append('preco', document.getElementById('edit-preco').value);
        formData.append('estoque', document.getElementById('edit-estoque').value);
        formData.append('categoria', document.getElementById('edit-categoria').value);
        formData.append('descricao', document.getElementById('edit-descricao').value);
        formData.append('fotosParaRemover', JSON.stringify(fotosParaRemover));

        for (const file of editFileInput.files) {
            formData.append('imagens', file);
        }

        try {
            const response = await fetchWithAuth(`/api/produtos/${id}`, { method: 'PUT', body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            editModal.style.display = 'none';
            carregarProdutos();
        } catch (error) {
            alert(error.message);
        }
    });

    produtosTableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const tr = target.closest('tr');
        if (!tr) return;
        const produtoId = tr.dataset.produtoId;

        if (target.classList.contains('btn-edit')) {
            try {
                editForm.reset();
                editPreviewsContainer.innerHTML = '';
                fotosParaRemover = [];

                const response = await fetchWithAuth(`/api/produtos/${produtoId}`);
                if (!response.ok) throw new Error('Erro ao buscar dados do produto.');
                const produto = await response.json();

                document.getElementById('edit-produto-id').value = produto.id;
                document.getElementById('edit-nome').value = produto.nome;
                document.getElementById('edit-codigo').value = produto.codigo;
                document.getElementById('edit-preco').value = produto.preco;
                document.getElementById('edit-estoque').value = produto.estoque;
                document.getElementById('edit-categoria').value = produto.categoria;
                document.getElementById('edit-descricao').value = produto.descricao;

                if (produto.fotos && produto.fotos.length > 0) {
                    produto.fotos.forEach(foto => {
                        const div = document.createElement('div');
                        div.className = 'foto-preview';
                        div.innerHTML = `<img src="${foto.url}" alt="Preview"><button type="button" class="btn-remover-foto">&times;</button>`;
                        editPreviewsContainer.appendChild(div);

                        div.querySelector('.btn-remover-foto').addEventListener('click', () => {
                            fotosParaRemover.push({ id: foto.id, public_id: foto.public_id });
                            div.remove();
                        });
                    });
                }

                editModal.style.display = 'flex';
            } catch (error) {
                alert(error.message);
            }
        }
        
        if (target.classList.contains('btn-delete')) {
             if (confirm('Tem certeza que deseja INATIVAR este produto? Ele não aparecerá mais para novas vendas.')) {
                try {
                    const response = await fetchWithAuth(`/api/produtos/${produtoId}`, { method: 'DELETE' });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    carregarProdutos();
                } catch (error) {
                    alert(error.message);
                }
            }
        }
    });
    
    selecionarTodosCheck.addEventListener('change', (event) => {
        document.querySelectorAll('.produto-checkbox').forEach(cb => {
            cb.checked = event.target.checked;
        });
    });

    inativarMassaBtn.addEventListener('click', async () => {
        const ids = obterIdsSelecionados();
        if (ids.length === 0) {
            alert('Selecione pelo menos um produto para inativar.');
            return;
        }
        if (!confirm(`Tem certeza que deseja inativar ${ids.length} produto(s)? Eles serão removidos da lista de produtos ativos.`)) {
            return;
        }
        try {
            const response = await fetchWithAuth('/api/produtos/inativar-em-massa', {
                method: 'PUT',
                body: JSON.stringify({ ids })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            alert(data.message);
            carregarProdutos();
            selecionarTodosCheck.checked = false;
        } catch (error) {
            alert(error.message);
        }
    });

    excluirMassaBtn.addEventListener('click', async () => {
        const ids = obterIdsSelecionados();
        if (ids.length === 0) {
            alert('Selecione pelo menos um produto para excluir.');
            return;
        }
        if (!confirm(`ATENÇÃO! Você está prestes a EXCLUIR PERMANENTEMENTE ${ids.length} produto(s). Essa ação é irreversível e só é possível para produtos SEM vendas associadas.`)) {
            return;
        }
        try {
            const response = await fetchWithAuth('/api/produtos/excluir-em-massa', {
                method: 'POST',
                body: JSON.stringify({ ids })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            alert(data.message);
            carregarProdutos();
            selecionarTodosCheck.checked = false;
        } catch (error) {
            alert(error.message);
        }
    });

    importCsvBtn.addEventListener('click', async () => {
        const file = csvFileInput.files[0];
        if (!file) {
            alert('Por favor, selecione um arquivo CSV.');
            return;
        }
        const formData = new FormData();
        formData.append('csvfile', file);
        try {
            const response = await fetchWithAuth('/api/produtos/importar-csv', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            alert(data.message);
            csvFileInput.value = '';
            csvFileNameSpan.textContent = 'Nenhum arquivo selecionado';
            csvFileNameSpan.style.fontStyle = 'italic';
            carregarProdutos();
        } catch (error) {
            alert(`Erro ao importar: ${error.message}`);
        }
    });

    downloadCsvTemplateBtn.addEventListener('click', () => {
        const csvContent = "nome,codigo,preco,estoque,descricao,categoria,foto_url,foto_public_id\n" +
             "Exemplo Produto,EX001,99.99,10,Descrição de exemplo.,Exemplo Categoria,http://example.com/foto.jpg,exemplo_public_id\n";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "modelo_produtos.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    cancelEditBtn.addEventListener('click', () => {
        editForm.reset();
        editModal.style.display = 'none';
    });
    
    logoutBtn.addEventListener('click', logout);

    atualizarBotaoOrdenacao();
    carregarProdutos();
    configurarLinkCatalogo();
});
