const API_URL = "https://a3-2lsq.onrender.com";

// Exibe mensagens interativas na tela
function mostrarMensagem(texto, tipo = "sucesso", duracao = 3000) {
  const msg = document.getElementById("mensagem");
  msg.className = `mensagem-visivel ${tipo}`;
  msg.textContent = texto;

  setTimeout(() => {
    msg.className = "mensagem-oculta";
  }, duracao);
}

document.addEventListener("DOMContentLoaded", () => {
  // Redireciona se o tipo do usuário não for ADM
  if (localStorage.getItem("tipo") !== "ADM") {
    mostrarMensagem("Acesso restrito! Somente administradores.", "aviso");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
    return;
  }

  carregarAgendamentos();
});

// Função para carregar todos os agendamentos pendentes
function carregarAgendamentos() {
  fetch(`${API_URL}/api/agendamentos`)
    .then(res => res.json())
    .then(agendamentos => {
      const container = document.getElementById("agendamentosContainer");
      container.innerHTML = "";

      if (!Array.isArray(agendamentos) || agendamentos.length === 0) {
        container.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
        return;
      }

      agendamentos.forEach(ag => {
        const card = document.createElement("div");
        card.className = "agendamento-card";

        card.innerHTML = `
          <p><strong>Usuário:</strong> ${ag.emailUsuario}</p>
          <p><strong>Nome:</strong> ${ag.nome}</p>
          <p><strong>Data:</strong> ${ag.data}</p>
          <p><strong>Hora:</strong> ${ag.hora}</p>
          <p><strong>CEP:</strong> ${ag.cep}</p>
          <p><strong>Cooperativa:</strong> ${ag.cooperativa}</p>
          <textarea placeholder="Observações..." class="observacao" rows="3"></textarea>
          <input type="number" placeholder="Pontos" class="pontos" min="0">
          <button class="confirmar-btn">Confirmar Coleta</button>
        `;

        const button = card.querySelector(".confirmar-btn");
        button.addEventListener("click", () => registrarReciclagem(ag.id, card, button));

        container.appendChild(card);
      });
    })
    .catch(() => {
      mostrarMensagem("Erro ao carregar agendamentos. Verifique a conexão.", "erro");
    });
}

// Função para registrar a reciclagem
function registrarReciclagem(agendamentoId, card, button) {
  const observacao = card.querySelector(".observacao").value.trim();
  const pontos = parseInt(card.querySelector(".pontos").value);

  if (!observacao || isNaN(pontos) || pontos < 0) {
    mostrarMensagem("⚠️ Preencha corretamente a observação e os pontos.", "aviso");
    return;
  }

  button.disabled = true;
  button.textContent = "Registrando...";

  fetch(`${API_URL}/api/reciclagem/${agendamentoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ observacao, pontos })
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao registrar reciclagem");
      return res.json();
    })
    .then(data => {
      mostrarMensagem("✅ " + data.message, "sucesso");
      card.style.opacity = "0.6";
      button.textContent = "Confirmado";
    })
    .catch(() => {
      mostrarMensagem("❌ Erro ao registrar reciclagem. Tente novamente.", "erro");
      button.disabled = false;
      button.textContent = "Confirmar Coleta";
    });
}

// Logout e limpeza de sessão
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
