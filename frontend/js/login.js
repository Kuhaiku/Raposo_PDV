document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageDiv.textContent = '';

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao tentar fazer login.');
            }

            localStorage.setItem('authToken', data.token);

            if (data.role === 'admin') {
                window.location.href = '/painel-empresa.html'; // Página de gestão da empresa
            } else {
                window.location.href = '/painel.html'; // Página do funcionário
            }
        } catch (error) {
            errorMessageDiv.textContent = error.message;
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('error-message');
    const senhaInput = document.getElementById('senha');
    const toggleSenhaIcon = document.getElementById('toggle-senha');

    // --- NOVO: LÓGICA PARA MOSTRAR/ESCONDER SENHA ---
    if (toggleSenhaIcon) {
        // Torna a div inteira ao redor do ícone clicável
        const toggleButton = toggleSenhaIcon.parentElement;
        
        toggleButton.addEventListener('click', () => {
            // Verifica o tipo atual do campo de senha
            const isPassword = senhaInput.type === 'password';
            
            // Troca o tipo do input
            senhaInput.type = isPassword ? 'text' : 'password';
            
            // Troca o ícone (o nome dos ícones do Material Symbols)
            toggleSenhaIcon.textContent = isPassword ? 'visibility' : 'lock';
        });
    }
    // --- FIM DA NOVA LÓGICA ---

    // Lógica de submit do formulário (existente)
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageDiv.textContent = '';

        const email = document.getElementById('email').value;
        const senha = senhaInput.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao tentar fazer login.');
            }

            localStorage.setItem('authToken', data.token);

            if (data.role === 'admin') {
                window.location.href = '/painel-empresa.html';
            } else {
                window.location.href = '/painel.html';
            }
        } catch (error) {
            errorMessageDiv.textContent = error.message;
        }
    });
});