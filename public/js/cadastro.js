const API_URL = "https://reciclassa.onrender.com";

// Lista de provedores permitidos
const provedoresPermitidos = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'live.com'
];

// Função para validar o domínio do e-mail
function emailEhPermitido(email) {
  const dominio = email.split('@')[1]?.toLowerCase();
  return provedoresPermitidos.includes(dominio);
}

// Lida com o envio do formulário de cadastro
document.getElementById('cadastroForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const nome = event.target.nome.value;
  const cpf = event.target.cpf.value;
  const email = event.target.email.value;
  const senha = event.target.senha.value;
  const cep = event.target.cep.value;
  const endereco = event.target.endereco.value;

  const statusMessage = document.getElementById('statusMessage');


  function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(cpf[10]);
}

if (!validarCPF(cpf)) {
  return res.status(400).json({ message: 'CPF inválido' });
}


  // Verifica se o e-mail pertence a um provedor permitido
  if (!emailEhPermitido(email)) {
    statusMessage.textContent = 'Apenas e-mails de provedores conhecidos como Gmail, Outlook, Hotmail, etc. são aceitos.';
    statusMessage.className = 'status-message error';
    return;
  }

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
