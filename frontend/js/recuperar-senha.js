document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-recuperar');
    const feedbackMessage = document.getElementById('feedback-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        feedbackMessage.textContent = '';
        const email = document.getElementById('email').value;

        try {
            const response = await fetch('/api/auth/solicitar-reset-senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            feedbackMessage.textContent = 'Código enviado! Verifique seu e-mail.';
            feedbackMessage.style.color = 'green';

            // Redireciona para a página de redefinição, passando o e-mail
            setTimeout(() => {
                window.location.href = `/redefinir-senha.html?email=${encodeURIComponent(email)}`;
            }, 2000);

        } catch (error) {
            feedbackMessage.textContent = error.message;
            feedbackMessage.style.color = 'red';
        }
    });
});