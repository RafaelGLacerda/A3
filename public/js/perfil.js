const API_URL = "https://a3-2lsq.onrender.com";
const emailUsuario = localStorage.getItem("email");

if (!emailUsuario) {
  alert("Usuário não autenticado.");
  window.location.href = "index.html";
}

function carregarPerfil() {
  const emailCodificado = encodeURIComponent(emailUsuario);
  fetch(`${API_URL}/profile/${emailCodificado}`)
    .then(res => {
      if (!res.ok) {
        throw new Error("Usuário não encontrado.");
      }
      return res.json();
    })
    .then(dados => {
      document.getElementById("nomeUsuario").textContent = dados.nome;
      document.getElementById("emailUsuario").textContent = dados.email;
      document.getElementById("enderecoUsuario").textContent = dados.endereco;
      document.getElementById("quantidadeReciclada").textContent = dados.quantidadeReciclada + " kg";
    })
    .catch((err) => {
      alert("Falha ao carregar dados do usuário: " + err.message);
      window.location.href = "index.html";
    });
}

function editarNome() {
  const novoNome = prompt("Digite o novo nome:");
  if (novoNome) {
    const emailCodificado = encodeURIComponent(emailUsuario);
    fetch(`${API_URL}/profile/${emailCodificado}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNome })
    }).then(() => carregarPerfil());
  }
}

function editarEndereco() {
  const novoEndereco = prompt("Digite o novo endereço:");
  if (novoEndereco) {
    const emailCodificado = encodeURIComponent(emailUsuario);
    fetch(`${API_URL}/profile/${emailCodificado}`, {
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
