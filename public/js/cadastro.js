document.getElementById('cadastroForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const nome = event.target.nome.value;
  const email = event.target.email.value;
  const senha = event.target.senha.value;
  const cep = event.target.cep.value;
  const endereco = event.target.endereco.value;

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
      alert('Cadastro bem-sucedido!');
      window.location.href = 'index.html';
    } else {
      alert(data.message);
    }
  })
  .catch(error => {
    alert('Erro ao cadastrar');
    console.error(error);
  });
});
