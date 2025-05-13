const API_URL = "https://a3-2lsq.onrender.com";

document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = event.target.email.value;
  const senha = event.target.senha.value;

  // Exibe mensagem de carregando
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = 'Entrando na sua conta...';
  statusMessage.style.color = '#007bff'; // azul

  fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Login bem-sucedido') {
      localStorage.setItem('email', email);
      statusMessage.textContent = `Bem-vindo(a), ${email}! Redirecionando...`;
      statusMessage.style.color = 'green';

      setTimeout(() => {
        window.location.href = 'bemvindo.html';
      }, 1500);
    } else {
      statusMessage.textContent = data.message;
      statusMessage.style.color = 'red';
    }
  })
  .catch(() => {
    statusMessage.textContent = 'Erro ao tentar logar. Tente novamente.';
    statusMessage.style.color = 'red';
  });
});
