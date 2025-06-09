fetch("sidebar.html")
  .then(res => res.text())
  .then(html => { document.getElementById("sidebar-container").innerHTML = html; });
document.addEventListener("DOMContentLoaded", () => {
  fetch("sidebar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("sidebar-container").innerHTML = html;

      window.toggleSidebar = function () {
        const sidebar = document.getElementById("sidebar");
        const toggleBtn = document.querySelector(".sidebar-toggle");
        const isCollapsed = sidebar.classList.toggle("collapsed");
        document.body.classList.toggle("sidebar-collapsed", isCollapsed);
        toggleBtn.textContent = isCollapsed ? "»" : "☰";
      };

      window.sair = function () {
        localStorage.removeItem('email');
        window.location.href = "index.html";
      };
    });
});

const API_URL      = "https://reciclassa.onrender.com";
const emailUsuario = localStorage.getItem("email");
let   pontosAtuais = 0;

const container      = document.getElementById("lista-premios");
const ulResgatados   = document.getElementById("premios-resgatados");

// Lista fixa de prêmios
const premios = [
  { nome: "Vale R$ 50",           pontos: 1000 },
  { nome: "Vale R$ 100",          pontos: 1800 },
  { nome: "Vale gás",             pontos: 1500 },
  { nome: "Vale-refeição R$ 50",  pontos: 800 },
  { nome: "Vale-refeição R$ 100", pontos: 1400 },
  { nome: "Vale-refeição R$ 250", pontos: 2200 },
  { nome: "Sacolas ecológicas",   pontos:  500 },
  { nome: "Ventilador",           pontos: 2000 },
  { nome: "Kit de cozinha",       pontos: 2000 },
  { nome: "Mochila ecológica",    pontos: 3000 },
  { nome: "Produtos de limpeza",  pontos: 1000 },
  { nome: "AIRFRYER",             pontos: 5000 }
];

// ─── Utilitários ───────────────────────────────────────────────────
const gerarCodigo = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

function mostrarMensagem(texto, erro = false) {
  const msg = document.getElementById("mensagem-resgate");
  
  // Definindo o conteúdo e a cor de fundo
  msg.textContent = texto;
  msg.style.backgroundColor = erro ? "#d32f2f" : "#388e3c";
  
  // Estilos dinâmicos
  msg.style.position = 'fixed';
  msg.style.top = '100px';  // Ajuste o valor de "top" conforme necessário
  msg.style.left = '50%';
  msg.style.transform = 'translateX(-50%)';
  msg.style.padding = '12px 20px';
  msg.style.borderRadius = '8px';
  msg.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
  msg.style.zIndex = '1000';
  msg.style.opacity = '0'; // Inicia invisível
  msg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  
  // Exibe a mensagem
  msg.classList.add("mensagem-visivel");
  
  // Define o comportamento da visibilidade
  setTimeout(() => msg.classList.remove("mensagem-visivel"), 4000);

  // Torna a mensagem visível
  setTimeout(() => {
    msg.style.opacity = '1';
    msg.style.transform = 'translateY(0)';
  }, 10); // Espera um pouco antes de mostrar a animação
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

  // Define imagem com base no nome do prêmio
  let imagem = "";
  switch (premio.nome) {
    case "Vale R$ 50":
      imagem = "img/vale50.png";
      break;
    case "Vale R$ 100":
      imagem = "img/vale100.png";
      break;
    case "Vale gás":
      imagem = "img/valegas.png";
      break;
    case "Vale-refeição R$ 50":
      imagem = "img/valerefeicao50.png";
      break;
    case "Vale-refeição R$ 100":
      imagem = "img/valerefeicao100.png";
      break;
    case "Vale-refeição R$ 250":
      imagem = "img/valerefeicao250.png";
      break;
    case "Sacolas ecológicas":
      imagem = "img/sacola.png";
      break;
    case "Ventilador":
      imagem = "img/ventilador.png";
      break;
    case "Kit de cozinha":
      imagem = "img/kitcozinha.png";
      break;
    case "Mochila ecológica":
      imagem = "img/mochila.png";
      break;
    case "Produtos de limpeza":
      imagem = "img/limpeza.png";
      break;
    case "AIRFRYER":
      imagem = "img/airfryer.png";
      break;
    default:
      imagem = "img/default.png"; // caso queira uma imagem genérica de fallback
  }

  card.innerHTML = `
    <img src="${imagem}" alt="${premio.nome}" style="max-width: 100%; height: 150px; object-fit: contain; margin-bottom: 10px;">
    <h3>${premio.nome}</h3>
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