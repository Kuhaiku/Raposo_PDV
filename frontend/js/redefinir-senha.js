document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-redefinir');
    const codeInputsContainer = document.getElementById('code-inputs');
    const codeInputs = codeInputsContainer.querySelectorAll('.code-input');
    const feedbackMessage = document.getElementById('feedback-message');
    
    // Pega o e-mail da URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (!email) {
        feedbackMessage.textContent = "E-mail não encontrado. Volte e tente novamente.";
        feedbackMessage.style.color = 'red';
    }

    // Lógica para pular para o próximo campo de código
    codeInputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            if (input.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        feedbackMessage.textContent = '';

        let code = '';
        codeInputs.forEach(input => code += input.value);
        const novaSenha = document.getElementById('nova-senha').value;

        if (code.length !== 6) {
            feedbackMessage.textContent = 'O código deve ter 6 dígitos.';
            feedbackMessage.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/api/auth/redefinir-senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, novaSenha })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            feedbackMessage.textContent = 'Senha redefinida com sucesso! Redirecionando...';
            feedbackMessage.style.color = 'green';

            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);

        } catch (error) {
            feedbackMessage.textContent = error.message;
            feedbackMessage.style.color = 'red';
        }
    });
});