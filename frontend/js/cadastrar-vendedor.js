document.addEventListener('DOMContentLoaded', () => {
    checkAuth('admin'); // Garante que só o admin acesse esta página

    const form = document.getElementById('cadastro-vendedor-form');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const errorMessageText = errorMessage.querySelector('p');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Esconde mensagens antigas
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        try {
            const response = await fetchWithAuth('/api/usuarios/cadastrar', {
                method: 'POST',
                body: JSON.stringify({ nome, email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ocorreu um erro.');
            }

            // Sucesso!
            form.reset();
            successMessage.classList.remove('hidden');

        } catch (error) {
            errorMessageText.textContent = error.message;
            errorMessage.classList.remove('hidden');
        }
    });
});