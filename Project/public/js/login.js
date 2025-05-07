document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = event.target.email.value;
  const senha = event.target.senha.value;

  fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Login bem-sucedido') {
      // SALVA o email do usuário logado
      localStorage.setItem('email', email);
      window.location.href = 'bemvindo.html';
    } else {
      alert(data.message);
    }
  })
  .catch(() => {
    alert('Erro ao tentar logar');
  });
});
