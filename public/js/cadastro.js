const API_URL = "https://reciclassa.onrender.com";

document.getElementById('cadastroForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const nome = event.target.nome.value;
  const email = event.target.email.value;
  const senha = event.target.senha.value;
  const cep = event.target.cep.value;
  const endereco = event.target.endereco.value;

  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = 'Cadastrando...';
  statusMessage.className = 'status-message loading';

  fetch(`${API_URL}/api/cadastro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nome, email, senha, cep, endereco }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Usuário cadastrado com sucesso') {
      statusMessage.textContent = 'Cadastro realizado com sucesso! Redirecionando...';
      statusMessage.className = 'status-message success';

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      statusMessage.textContent = data.message;
      statusMessage.className = 'status-message error';
    }
  })
  .catch(error => {
    statusMessage.textContent = 'Erro ao cadastrar. Tente novamente.';
    statusMessage.className = 'status-message error';
    console.error(error);
  });
});
