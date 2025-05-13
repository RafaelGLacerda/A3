
  document.addEventListener("DOMContentLoaded", () => {
    carregarSidebar();
    verificarLoginECarregarAgendamentos();
    configurarModal();
  });

  const tbody = document.querySelector('#tabelaAgendamentos tbody');
  const modal = document.getElementById("modalConfirmacao");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const btnCancelar = document.getElementById("btnCancelar");
  let idAgendamentoAtual = null;

  function carregarSidebar() {
    fetch("sidebar.html")
      .then(response => response.text())
      .then(html => {
        document.getElementById("sidebar-container").innerHTML = html;
      })
      .catch(() => {
        console.error("Erro ao carregar a sidebar.");
      });
  }

  function verificarLoginECarregarAgendamentos() {
    const email = localStorage.getItem("email");

    if (!email) {
      tbody.innerHTML = '<tr><td colspan="8">⚠️ Usuário não está logado.</td></tr>';
      return;
    }

    buscarAgendamentos(email);
  }

  function buscarAgendamentos(email) {
    fetch(`/api/agendamentos/${email}`)
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar dados do servidor.");
        return res.json();
      })
      .then(agendamentos => preencherTabela(agendamentos, email))
      .catch(err => {
        tbody.innerHTML = `<tr><td colspan="8">❌ ${err.message}</td></tr>`;
      });
  }

  function preencherTabela(agendamentos, email) {
    if (!agendamentos.length) {
      tbody.innerHTML = '<tr><td colspan="8">❌ Nenhum agendamento encontrado.</td></tr>';
      return;
    }

    agendamentos.forEach((ag, index) => {
      const agId = ag.id || `${email}-${index}`;
      const realizado = ag.status === "realizado";

      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${ag.nome}</td>
        <td>${ag.data}</td>
        <td>${ag.hora}</td>
        <td>${ag.cep}</td>
        <td>${ag.cooperativa}</td>
        <td>${realizado ? "✅ Realizado" : "⌛ Pendente"}</td>
        <td>${realizado ? (ag.comentarioAdm || "Sem observações.") : "-"}</td>
        <td>
          ${realizado
            ? "✔️"
            : `<button class="btn-cancelar" onclick="abrirModalCancelamento('${agId}')">Desistir da coleta</button>`
          }
        </td>
      `;
      tbody.appendChild(linha);
    });
  }

  function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo} visivel`;
    setTimeout(() => mensagem.classList.remove("visivel"), 3000);
  }

  // Modal
  function configurarModal() {
    btnCancelar.addEventListener("click", () => {
      modal.style.display = "none";
      idAgendamentoAtual = null;
    });

    btnConfirmar.addEventListener("click", confirmarCancelamento);
  }

  function abrirModalCancelamento(id) {
    idAgendamentoAtual = id;
    modal.style.display = "flex";
  }

  function confirmarCancelamento() {
    if (!idAgendamentoAtual) return;

    fetch(`/api/agendamentos/${idAgendamentoAtual}`, {
      method: "DELETE",
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao cancelar agendamento.");
        mostrarMensagem("✅ Agendamento cancelado com sucesso!", "sucesso");
        modal.style.display = "none";
        setTimeout(() => location.reload(), 1000);
      })
      .catch(err => {
        mostrarMensagem(`❌ ${err.message}`, "erro");
        modal.style.display = "none";
      });

    idAgendamentoAtual = null;
  }

  // Disponibiliza para uso inline no HTML
  window.abrirModalCancelamento = abrirModalCancelamento;

