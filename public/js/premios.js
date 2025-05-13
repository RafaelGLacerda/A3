    // Carrega a sidebar
    fetch("sidebar.html")
      .then(res => res.text())
      .then(html => {
        document.getElementById("sidebar-container").innerHTML = html;
      });
const API_URL = "https://a3-2lsq.onrender.com";
    const emailUsuario = localStorage.getItem("email");
    let pontosAtuais = 0;

    const container = document.getElementById("lista-premios");
    const ulResgatados = document.getElementById("premios-resgatados");

    const premios = [
      { nome: "Vale R$ 50", quantidade: 100, pontos: 1000 },
      { nome: "Vale R$ 100", quantidade: 100, pontos: 1800 },
      { nome: "Vale gás", quantidade: 50, pontos: 2000 },
      { nome: "Vale-refeição R$ 50", quantidade: 50, pontos: 1000 },
      { nome: "Vale-refeição R$ 100", quantidade: 100, pontos: 1800 },
      { nome: "Vale-refeição R$ 250", quantidade: 50, pontos: 2300 },
      { nome: "Sacolas ecológicas", quantidade: 50, pontos: 500 },
      { nome: "Ventilador", quantidade: 5, pontos: 2500 },
      { nome: "Kit de cozinha", quantidade: 5, pontos: 2000 },
      { nome: "Mochila ecológica", quantidade: 5, pontos: 5000 },
      { nome: "Produtos de limpeza", quantidade: 10, pontos: 1000 },
      { nome: "AIRFRYER", quantidade: 3, pontos: 50000 }
    ];

    function gerarCodigo() {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    function mostrarMensagem(texto, erro = false) {
      const mensagem = document.getElementById("mensagem-resgate");
      mensagem.textContent = texto;
      mensagem.style.backgroundColor = erro ? "#d32f2f" : "#388e3c";
      mensagem.classList.add("mensagem-visivel");
      setTimeout(() => mensagem.classList.remove("mensagem-visivel"), 4000);
    }

    function carregarPremiosResgatados() {
      fetch(`${API_URL}/resgatados/${encodeURIComponent(emailUsuario)}`)
        .then(res => res.json())
        .then(data => {
          ulResgatados.innerHTML = '';
          if (!data.length) {
            ulResgatados.innerHTML = '<li>Nenhum prêmio resgatado ainda.</li>';
            return;
          }
          data.forEach(pr => {
            const li = document.createElement('li');
            li.textContent = `${pr.nome} - Código: ${pr.codigo}`;
            ulResgatados.appendChild(li);
          });
        });
    }

    function carregarPontos() {
      fetch(`${API_URL}/profile/${encodeURIComponent(emailUsuario)}`)
        .then(res => res.json())
        .then(dados => {
          pontosAtuais = dados.pontos || 0;
          document.querySelector("#meus-pontos h3").textContent = `Você tem ${pontosAtuais} pontos.`;
        });
    }

    let premioSelecionado = null;

// Função para abrir a modal
function abrirModal(premio) {
  premioSelecionado = premio;
  document.getElementById("modal-texto").textContent = 
    `Você deseja resgatar "${premio.nome}" por ${premio.pontos} pontos?`;
  document.getElementById("modal-confirmacao").classList.remove("hidden");
}

// Fecha a modal
function fecharModal() {
  document.getElementById("modal-confirmacao").classList.add("hidden");
  premioSelecionado = null;
}

// Função chamada no botão "Resgatar"
function resgatarPremio(nome, custo) {
  if (pontosAtuais < custo) {
    mostrarMensagem("❌ Você não tem pontos suficientes para esse prêmio.", true);
    return;
  }

  abrirModal({ nome, pontos: custo });
}

// Evento do botão confirmar
document.getElementById("btn-confirmar").addEventListener("click", () => {
  if (!premioSelecionado) return;

  const { nome, pontos } = premioSelecionado;
  const codigo = gerarCodigo();

  fetch(`${API_URL}/api/resgatar-premio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailUsuario,
      nomePremio: nome,
      codigo,
      custo: pontos
    })
  })
    .then(res => res.json())
    .then(data => {
      mostrarMensagem(`🎉 Prêmio "${nome}" resgatado com sucesso! Código: ${codigo}`);
      carregarPontos();
      carregarPremiosResgatados();
      fecharModal();
    });
});

// Evento do botão cancelar
document.getElementById("btn-cancelar").addEventListener("click", fecharModal);

// Renderiza os prêmios disponíveis
premios.forEach(premio => {
  const card = document.createElement("div");
  card.className = "card-premio";
  card.innerHTML = `
    <h3>${premio.nome}</h3>
    <p><strong>Estoque:</strong> ${premio.quantidade}</p>
    <p><strong>Pontos:</strong> ${premio.pontos}</p>
    <button class="btn-resgatar">Resgatar</button>
  `;

  card.querySelector(".btn-resgatar").addEventListener("click", () => {
    resgatarPremio(premio.nome, premio.pontos);
  });

  container.appendChild(card);
});

carregarPontos();
carregarPremiosResgatados();