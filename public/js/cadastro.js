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

// Valida se o domínio do e-mail é aceito
function emailEhPermitido(email) {
  const dominio = email.split('@')[1]?.toLowerCase();
  return provedoresPermitidos.includes(dominio);
}

// Validação de CPF real
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

// Máscara de CPF ao digitar
const cpfInput = document.getElementById("cpf");
cpfInput.addEventListener("input", () => {
  let value = cpfInput.value.replace(/\D/g, '');

  if (value.length > 11) value = value.slice(0, 11);

  let formatted = value;
  if (value.length > 3 && value.length <= 6) {
    formatted = value.replace(/(\d{3})(\d+)/, '$1.$2');
  } else if (value.length > 6 && value.length <= 9) {
    formatted = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  } else if (value.length > 9) {
    formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
  }

  cpfInput.value = formatted;
});

// Envio do formulário de cadastro
document.getElementById("cadastroForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const nome = event.target.nome.value.trim();
  const email = event.target.email.value.trim();
  const senha = event.target.senha.value;
  const cep = event.target.cep.value.trim();
  const endereco = event.target.endereco.value.trim();
  const cpf = cpfInput.value.trim();

  const statusMessage = document.getElementById("statusMessage");

  if (!emailEhPermitido(email)) {
    statusMessage.textContent = "Apenas e-mails de provedores conhecidos (Gmail, Outlook, etc.) são aceitos.";
    statusMessage.className = "status-message error";
    return;
  }

  if (!validarCPF(cpf)) {
    statusMessage.textContent = "CPF inválido. Verifique e tente novamente.";
    statusMessage.className = "status-message error";
    return;
  }

  statusMessage.textContent = "Cadastrando...";
  statusMessage.className = "status-message loading";

  fetch(`${API_URL}/api/cadastro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha, cep, endereco, cpf })
  })
    .then(response => response.json())
    .then(data => {
      if (data.message === "Usuário cadastrado com sucesso") {
        statusMessage.textContent = "Cadastro realizado com sucesso! Redirecionando...";
        statusMessage.className = "status-message success";
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        statusMessage.textContent = data.message;
        statusMessage.className = "status-message error";
      }
    })
    .catch(error => {
      console.error(error);
      statusMessage.textContent = "Erro ao cadastrar. Tente novamente.";
      statusMessage.className = "status-message error";
    });
});
