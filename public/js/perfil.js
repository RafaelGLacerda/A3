const emailUsuario = localStorage.getItem("email");
const API_URL = "https://a3-2lsq.onrender.com";
if (!emailUsuario) {
  alert("Usuário não autenticado.");
  window.location.href = "index.html";
}
function carregarPerfil() {
  fetch(`${API_URL}/api/profile/${emailUsuario}`)
    .then(res => res.json())
    .then(dados => {
      document.getElementById("nomeUsuario").textContent = dados.nome;
      document.getElementById("emailUsuario").textContent = dados.email;
      document.getElementById("enderecoUsuario").textContent = dados.endereco;
      document.getElementById("quantidadeReciclada").textContent = dados.quantidadeReciclada + " kg";
    })
    .catch(() => {
      alert("Falha ao carregar dados do usuário.");
    });
}


function editarNome() {
  const novoNome = prompt("Digite o novo nome:");
  if (novoNome) {
    fetch(`${API_URL}/api/profile/${emailUsuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNome })
    }).then(() => carregarPerfil());
  }
}

function editarEndereco() {
  const novoEndereco = prompt("Digite o novo endereço:");
  if (novoEndereco) {
    fetch(`${API_URL}/api/profile/${emailUsuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endereco: novoEndereco })
    }).then(() => carregarPerfil());
  }
}

// Carrega barra lateral e perfil
fetch("sidebar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("sidebar-container").innerHTML = html;
  });

carregarPerfil();
