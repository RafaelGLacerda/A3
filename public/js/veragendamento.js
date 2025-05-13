// Carrega o conteúdo da sidebar
fetch("sidebar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("sidebar-container").innerHTML = data;
  });

const email = localStorage.getItem('email');
const tbody = document.querySelector('#tabelaAgendamentos tbody');

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo) {
  const msg = document.getElementById("mensagem");
  msg.textContent = texto;
  msg.className = `mensagem ${tipo} visivel`;
  setTimeout(() => {
    msg.classList.remove("visivel");
  }, 3000);
}

// Verifica se usuário está logado
if (!email) {
  tbody.innerHTML = '<tr><td colspan="8">⚠️ Usuário não está logado.</td></tr>';
} else {
  fetch(`/api/agendamentos/${email}`)
    .then(res => {
      if (!res.ok) throw new Error('Falha ao buscar os dados do servidor.');
      return res.json();
    })
    .then(agendamentos => {
      if (agendamentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">❌ Nenhum agendamento encontrado.</td></tr>';
      } else {
        agendamentos.forEach((ag, index) => {
          const agId = ag.id || `${email}-${index}`;
          const realizado = ag.status === "realizado";

          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${ag.nome}</td>
            <td>${ag.data}</td>
            <td>${ag.hora}</td>
            <td>${ag.cep}</td>
            <td>${ag.cooperativa}</td>
            <td>${realizado ? "✅ Realizado" : "⌛ Pendente"}</td>
            <td>${realizado ? (ag.comentarioAdm || "Sem observações.") : "-"}</td>
            <td>
              ${realizado ? "✔️" : `<button class="btn-cancelar" onclick="cancelarAgendamento('${agId}')">Desistir da coleta</button>`}
            </td>
          `;
          tbody.appendChild(row);
        });
      }
    })
    .catch(err => {
      tbody.innerHTML = `<tr><td colspan="8">❌ Erro ao carregar agendamentos: ${err.message}</td></tr>`;
    });
}

// Lógica de cancelamento
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

  fetch(`/api/agendamentos/${idAgendamentoAtual}`, {
    method: 'DELETE'
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
