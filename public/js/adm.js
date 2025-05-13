const API_URL = "https://a3-2lsq.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  // Redireciona se não for ADM
  if (localStorage.getItem("tipo") !== "ADM") {
    alert("Acesso restrito!");
    window.location.href = "index.html";
    return;
  }

  carregarAgendamentos();
});

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
          <textarea placeholder="Observações..." class="observacao"></textarea>
          <input type="number" placeholder="Pontos" class="pontos" min="0">
          <button class="confirmar-btn">Confirmar Coleta</button>
        `;

        const button = card.querySelector(".confirmar-btn");
        button.addEventListener("click", () => registrarReciclagem(ag.id, card, button));

        container.appendChild(card);
      });
    })
    .catch(() => {
      alert("Erro ao carregar agendamentos.");
    });
}

function registrarReciclagem(agendamentoId, card, button) {
  const observacao = card.querySelector(".observacao").value.trim();
  const pontos = parseInt(card.querySelector(".pontos").value);

  if (!observacao || isNaN(pontos) || pontos < 0) {
    alert("Preencha a observação e os pontos corretamente.");
    return;
  }

  button.disabled = true;
  button.textContent = "Registrando...";

  fetch(`${API_URL}/api/reciclagem/${agendamentoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ observacao, pontos })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Erro ao registrar reciclagem");
      }
      return res.json();
    })
    .then(data => {
      alert(data.message);
      card.style.opacity = "0.5";
      button.textContent = "Confirmado";
    })
    .catch(() => {
      alert("Erro ao registrar reciclagem.");
      button.disabled = false;
      button.textContent = "Confirmar Coleta";
    });
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
