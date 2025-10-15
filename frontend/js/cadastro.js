document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastro-form');
    const errorMessageDiv = document.getElementById('error-message');
    const successMessageDiv = document.getElementById('success-message');

    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageDiv.textContent = '';
        successMessageDiv.textContent = '';

        const nome_empresa = document.getElementById('nome_empresa').value;
        const nome_usuario = document.getElementById('nome_usuario').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await fetch('/api/auth/cadastrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome_empresa, nome_usuario, email, senha })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao cadastrar.');
            }

            cadastroForm.reset();
            successMessageDiv.textContent = 'Cadastro realizado! Redirecionando para o login...';

            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);

        } catch (error) {
            errorMessageDiv.textContent = error.message;
        }
    });
});