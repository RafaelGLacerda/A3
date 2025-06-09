const API_URL = "https://reciclassa.onrender.com";

const COOPERATIVAS_WHATSAPP = {
  "Limpurb Itaigara": "71932025000",
  "Limpurb Pirajá": "71932025000",
  "Ecoponto Prefeitura de Salvador Alto da Terezinha": "71932025000",
  "Cooperativa COOPERLIX Valéria": "71945678901",
  "COOPERBRAVA São Marcos": "71933669037",
  "COOPERES Ilha Amarela": "71985340776",
  "CANORE Santa Cruz": "71991052926",
  "Recicla Salvador Cidade Alta": "71991343624",
  "Salvador Reciclagem Imbuí": "71986015987",
  "Solaris Reciclagem Fazenda Grande Do Retiro": "71996026501"
};

// Carrega a sidebar
fetch("sidebar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("sidebar-container").innerHTML = data;
  });

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

const email = localStorage.getItem('email');
const tbody = document.querySelector('#tabelaAgendamentos tbody');

function mostrarMensagem(texto, tipo) {
  const msg = document.getElementById("mensagem");
  msg.textContent = texto;
  msg.className = `mensagem ${tipo} visivel`;
  setTimeout(() => {
    msg.classList.remove("visivel");
  }, 3000);
}

if (!email) {
  tbody.innerHTML = '<tr><td colspan="9">⚠️ Usuário não está logado.</td></tr>';
} else {
  fetch(`${API_URL}/api/agendamentos/${email}`)
    .then(res => {
      if (!res.ok) throw new Error('Falha ao buscar os dados do servidor.');
      return res.json();
    })
    .then(agendamentos => {
      if (agendamentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">❌ Nenhum agendamento encontrado.</td></tr>';
      } else {
        agendamentos.forEach((ag, index) => {
          const agId = ag.id || `${email}-${index}`;

          let statusTexto = "⌛ Pendente";
          if (ag.status === "realizado") {
            statusTexto = "✅ Realizado";
          } else if (ag.status === "indeferido") {
            statusTexto = "❌ Indeferido";
          }

          const whatsappNumber = COOPERATIVAS_WHATSAPP[ag.cooperativa];
const whatsappLink = whatsappNumber
  ? `<a href="https://wa.me/55${whatsappNumber}" target="_blank" class="btn-whatsapp">WhatsApp</a>`
  : "—";

const row = document.createElement('tr');

row.innerHTML = `
  <td>${ag.nome}</td>
  <td>${formatarDataBrasileira(ag.data)}</td>
  <td>${ag.hora}</td>
  <td>${ag.cep}</td>
  <td>${ag.cooperativa}</td>
  <td>${statusTexto}</td>
  <td>${whatsappLink}</td>
  <td>${ag.status === "realizado" ? (ag.comentarioAdm || "Sem observações.") : "-"}</td>
  <td>
    ${ag.status === "pendente"
      ? `<button class="btn-cancelar" onclick="cancelarAgendamento('${agId}')">Desistir da coleta</button>`
      : "—"}
  </td>
  <td>
    ${ag.imagem
      ? `<img src="${API_URL}${ag.imagem}" alt="Imagem de reciclagem" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;" />`
      : "Sem imagem"}
  </td>
`;


          tbody.appendChild(row);
        });
      }
    })
    .catch(err => {
      tbody.innerHTML = `<tr><td colspan="9">❌ Erro ao carregar agendamentos: ${err.message}</td></tr>`;
    });
}

let idAgendamentoAtual = null;
const modal = document.getElementById("modalConfirmacao");
const btnConfirmar = document.getElementById("btnConfirmar");
const btnCancelar = document.getElementById("btnCancelar");

function cancelarAgendamento(id) {
  idAgendamentoAtual = id;
  modal.style.display = "flex";
}

btnCancelar.addEventListener("click", () => {
  modal.style.display = "none";
  idAgendamentoAtual = null;
});

btnConfirmar.addEventListener("click", () => {
  if (!idAgendamentoAtual) return;

  const email = localStorage.getItem('email');

  fetch(`${API_URL}/api/agendamentos/${idAgendamentoAtual}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao cancelar agendamento.');
      mostrarMensagem("✅ Agendamento cancelado com sucesso!", "sucesso");
      modal.style.display = "none";
      setTimeout(() => location.reload(), 1000);
    })
    .catch(err => {
      mostrarMensagem("❌ Erro ao cancelar agendamento: " + err.message, "erro");
      modal.style.display = "none";
    });

  idAgendamentoAtual = null;
});
function formatarDataBrasileira(dataISO) {
  const data = new Date(dataISO);
  if (isNaN(data)) return dataISO; // fallback se a data for inválida
  return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}
