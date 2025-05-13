const API_URL = "https://a3-2lsq.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  // Redireciona se não for ADM
  if (localStorage.getItem("tipo") !== "ADM") {
    alert("Acesso restrito!");
    window.location.href = "index.html";
    return;
  }

  fetch(`${API_URL}/api/agendamentos`)
    .then(res => res.json())
    .then(agendamentos => {
      const container = document.getElementById("agendamentosContainer");
      container.innerHTML = "";

      if (agendamentos.length === 0) {
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
          <button onclick="registrarReciclagem('${ag.id}', this)">Confirmar Coleta</button>
        `;
        container.appendChild(card);
      });
    });
});

function registrarReciclagem(agendamentoId, button) {
  const card = button.closest(".agendamento-card");
  const observacao = card.querySelector(".observacao").value;
  const pontos = parseInt(card.querySelector(".pontos").value);

  if (!observacao || isNaN(pontos)) {
    alert("Preencha a observação e os pontos.");
    return;
  }

  fetch(`${API_URL}/api/reciclagem/${agendamentoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ observacao, pontos })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    location.reload();
  })
  .catch(() => {
    alert("Erro ao registrar reciclagem.");
  });
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
