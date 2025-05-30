const API_URL = "https://reciclassa.onrender.com";

document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = event.target.email.value;
  const senha = event.target.senha.value;

  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = 'Entrando na sua conta...';
  statusMessage.style.color = '#007bff';

  fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  })
  .then(response => {
    if (!response.ok) throw new Error('Falha no login');
    return response.json();
  })
  .then(data => {
    if (data.message === 'Login bem-sucedido') {
      localStorage.setItem('email', email);
      localStorage.setItem('tipo', data.tipo); // Salva tipo (ADM ou USER)

      statusMessage.textContent = `Bem-vindo(a), ${email}! Redirecionando...`;
      statusMessage.style.color = 'green';

      setTimeout(() => {
        if (data.tipo === 'ADM') {
          window.location.href = 'adm.html';
        } else {
          window.location.href = 'bemvindo.html';
        }
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
