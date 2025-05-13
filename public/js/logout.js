document.addEventListener('DOMContentLoaded', function () {
  const logoutButtons = document.querySelectorAll('.logout');  // Seleciona todos os botões com a classe 'logout'
  
  logoutButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Limpa o localStorage
      localStorage.removeItem('email');  // Ou 'usuarioLogado', dependendo de como você armazena os dados

      // Redireciona para a página inicial
      window.location.href = "index.html";
    });
  });
});
