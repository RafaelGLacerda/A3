fetch("sidebar.html")
  .then(res => res.text())
  .then(html => { document.getElementById("sidebar-container").innerHTML = html; });

const API_URL      = "https://a3-2lsq.onrender.com";
const emailUsuario = localStorage.getItem("email");
let   pontosAtuais = 0;

const container      = document.getElementById("lista-premios");
const ulResgatados   = document.getElementById("premios-resgatados");

// Lista fixa de prêmios
const premios = [
  { nome: "Vale R$ 50",            quantidade: 100, pontos: 1000 },
  { nome: "Vale R$ 100",           quantidade: 100, pontos: 1800 },
  { nome: "Vale gás",              quantidade:  50, pontos: 2000 },
  { nome: "Vale-refeição R$ 50",   quantidade:  50, pontos: 1000 },
  { nome: "Vale-refeição R$ 100",  quantidade: 100, pontos: 1800 },
  { nome: "Vale-refeição R$ 250",  quantidade:  50, pontos: 2300 },
  { nome: "Sacolas ecológicas",    quantidade:  50, pontos:  500 },
  { nome: "Ventilador",            quantidade:   5, pontos: 2500 },
  { nome: "Kit de cozinha",        quantidade:   5, pontos: 2000 },
  { nome: "Mochila ecológica",     quantidade:   5, pontos: 5000 },
  { nome: "Produtos de limpeza",   quantidade:  10, pontos: 1000 },
  { nome: "AIRFRYER",              quantidade:   3, pontos: 50000 }
];

// ─── Utilitários ───────────────────────────────────────────────────
const gerarCodigo = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

function mostrarMensagem(texto, erro = false) {
  const msg = document.getElementById("mensagem-resgate");
  msg.textContent           = texto;
  msg.style.backgroundColor = erro ? "#d32f2f" : "#388e3c";
  msg.classList.add("mensagem-visivel");
  setTimeout(() => msg.classList.remove("mensagem-visivel"), 4000);
}

// ─── Carregar dados do usuário ─────────────────────────────────────
async function carregarPontos() {
  if (!emailUsuario) return;
  try {
    const res   = await fetch(`${API_URL}/profile/${encodeURIComponent(emailUsuario)}`);
    const dados = await res.json();
    pontosAtuais = dados.pontos || 0;
    document.querySelector("#meus-pontos h3")
      .textContent = `Você tem ${pontosAtuais} pontos.`;
  } catch (e) {
    console.error("Erro ao carregar pontos:", e);
  }
}

async function carregarPremiosResgatados() {
  if (!emailUsuario) return;
  try {
    const res = await fetch(`${API_URL}/resgatados/${encodeURIComponent(emailUsuario)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const lista = await res.json();

    ulResgatados.innerHTML = "";
    if (!lista.length) {
      ulResgatados.innerHTML = "<li>Nenhum prêmio resgatado ainda.</li>";
      return;
    }

    lista.forEach(pr => {
      const li = document.createElement("li");
      li.textContent = `${pr.nome} - Código: ${pr.codigo}`;
      ulResgatados.appendChild(li);
    });
  } catch (e) {
    console.error("Erro ao carregar resgates:", e);
    ulResgatados.innerHTML = "<li>Não foi possível carregar seus resgates.</li>";
  }
}

// ─── Modal de confirmação ──────────────────────────────────────────
let premioSelecionado = null;

function abrirModal(premio) {
  premioSelecionado = premio;
  document.getElementById("modal-texto").textContent =
    `Você deseja resgatar "${premio.nome}" por ${premio.pontos} pontos?`;
  document.getElementById("modal-confirmacao").classList.remove("hidden");
}

function fecharModal() {
  document.getElementById("modal-confirmacao").classList.add("hidden");
  premioSelecionado = null;
}

// ─── Resgate ───────────────────────────────────────────────────────
function resgatarPremio(nome, custo) {
  if (pontosAtuais < custo) {
    mostrarMensagem("❌ Você não tem pontos suficientes para esse prêmio.", true);
    return;
  }
  abrirModal({ nome, pontos: custo });
}

document.getElementById("btn-confirmar").addEventListener("click", async () => {
  if (!premioSelecionado) return;

  const { nome, pontos } = premioSelecionado;
  const codigo = gerarCodigo();

  try {
    const res = await fetch(`${API_URL}/api/resgatar-premio`, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({
        email      : emailUsuario,
        nomePremio : nome,
        codigo,
        custo      : pontos
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await res.json();

    mostrarMensagem(`🎉 Prêmio "${nome}" resgatado com sucesso! Código: ${codigo}`);
    await carregarPontos();
    await carregarPremiosResgatados();
  } catch (e) {
    console.error("Erro ao resgatar prêmio:", e);
    mostrarMensagem("❌ Erro ao resgatar prêmio. Tente novamente.", true);
  } finally {
    fecharModal();
  }
});

document.getElementById("btn-cancelar").addEventListener("click", fecharModal);

// ─── Renderizar prêmios disponíveis ────────────────────────────────
premios.forEach(premio => {
  const card = document.createElement("div");
  card.className = "card-premio";
  card.innerHTML = `
    <h3>${premio.nome}</h3>
    <p><strong>Estoque:</strong> ${premio.quantidade}</p>
    <p><strong>Pontos:</strong> ${premio.pontos}</p>
    <button class="btn-resgatar">Resgatar</button>
  `;
  card.querySelector(".btn-resgatar")
      .addEventListener("click", () => resgatarPremio(premio.nome, premio.pontos));
  container.appendChild(card);
});

// ─── Inicialização ─────────────────────────────────────────────────
carregarPontos();
carregarPremiosResgatados();