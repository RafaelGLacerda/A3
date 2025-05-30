const API_URL = "https://reciclassa.onrender.com";
const emailUsuario = localStorage.getItem("email");
const statusMessage = document.getElementById("statusMessage");

if (!emailUsuario) {
  statusMessage.textContent = "Usuário não autenticado. Redirecionando...";
  statusMessage.className = "status-message error";
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
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
      document.getElementById("pontosUsuario").textContent = dados.pontos + " pontos";
    })
    .catch((err) => {
      statusMessage.textContent = "Falha ao carregar dados do usuário: " + err.message;
      statusMessage.className = "status-message error";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 3000);
    });
}

function abrirModal(titulo, valorAtual, callback) {
  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalInput = document.getElementById('modalInput');
  const modalSave = document.getElementById('modalSave');
  const modalCancel = document.getElementById('modalCancel');

  modalTitle.textContent = titulo;
  modalInput.value = valorAtual || '';
  modal.style.display = 'block';

  // Salvar
  modalSave.onclick = () => {
    const novoValor = modalInput.value.trim();
    if (novoValor) {
      callback(novoValor);
      modal.style.display = 'none';
    }
  };

  // Cancelar
  modalCancel.onclick = () => {
    modal.style.display = 'none';
  };

  // Fechar ao clicar fora
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

function editarNome() {
  const nomeAtual = document.getElementById("nomeUsuario").textContent;
  abrirModal("Editar Nome", nomeAtual, (novoNome) => {
    const emailCodificado = encodeURIComponent(emailUsuario);
    fetch(`${API_URL}/profile/${emailCodificado}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNome })
    })
    .then(() => {
      statusMessage.textContent = "Nome atualizado com sucesso!";
      statusMessage.className = "status-message success";
      carregarPerfil();
    });
  });
}

function editarEndereco() {
  const enderecoAtual = document.getElementById("enderecoUsuario").textContent;
  abrirModal("Editar Endereço", enderecoAtual, (novoEndereco) => {
    const emailCodificado = encodeURIComponent(emailUsuario);
    fetch(`${API_URL}/profile/${emailCodificado}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endereco: novoEndereco })
    })
    .then(() => {
      statusMessage.textContent = "Endereço atualizado com sucesso!";
      statusMessage.className = "status-message success";
      carregarPerfil();
    });
  });
}


carregarPerfil();
