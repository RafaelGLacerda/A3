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
function formatarDataBrasileira(dataISO) {
  const data = new Date(dataISO);
  if (isNaN(data)) return dataISO;
  return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function carregarAgendamentos() {
  fetch(`${API_URL}/api/agendamentos`)
    .then(res => res.json())
    .then(agendamentos => {
      const container = document.getElementById("agendamentosContainer");
      container.innerHTML = "";

      // ✅ Filtrar apenas agendamentos pendentes
      agendamentos = agendamentos.filter(ag => ag.status === "pendente");

      if (!Array.isArray(agendamentos) || agendamentos.length === 0) {
        container.innerHTML = "<p>Nenhum agendamento pendente encontrado.</p>";
        return;
      }

      agendamentos.forEach(ag => {
        const card = document.createElement("div");
        card.className = "agendamento-card";

        card.innerHTML = `
          <p><strong>Usuário:</strong> ${ag.emailUsuario}</p>
          <p><strong>Nome:</strong> ${ag.nome}</p>
          <p><strong>Data:</strong> ${formatarDataBrasileira(ag.data)}</p>
          <p><strong>Hora:</strong> ${ag.hora}</p>
          <p><strong>CEP:</strong> ${ag.cep}</p>
          <p><strong>Endereço:</strong> ${ag.enderecoUsuario || "Não disponível"}</p>
          <p><strong>Cooperativa:</strong> ${ag.cooperativa}</p>
          ${ag.imagem
            ? `<div><strong>Imagem do usuário:</strong><br><img src="${API_URL}${ag.imagem}" alt="Imagem de reciclagem" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"></div>`
            : "<p><em>Sem imagem enviada pelo usuário.</em></p>"}
          <textarea placeholder="Observações..." class="observacao" rows="3"></textarea>
          <input type="number" placeholder="Pontos" class="pontos" min="0">
          <p><strong>Imagem da Coleta (opcional):</strong></p>
          <input type="file" accept="image/*" class="imagem-adm" />
          <button class="confirmar-btn">Confirmar Coleta</button>
          <button class="indeferir-btn">Indeferir Coleta</button>
        `;

        const confirmarButton = card.querySelector(".confirmar-btn");
        const indeferirButton = card.querySelector(".indeferir-btn");

        confirmarButton.addEventListener("click", () => registrarReciclagem(ag.id, card, confirmarButton));
        indeferirButton.addEventListener("click", () => indeferirColeta(ag.id, card, indeferirButton));

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
  const inputImagem = card.querySelector(".imagem-adm");
  const arquivo = inputImagem.files[0];

  if (!observacao || isNaN(pontos) || pontos < 0) {
    mostrarMensagem("⚠️ Preencha corretamente a observação e os pontos.", "aviso");
    return;
  }

  button.disabled = true;
  button.textContent = "Registrando...";

  if (arquivo) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imagemBase64 = reader.result;
      enviarReciclagem(agendamentoId, observacao, pontos, imagemBase64, card, button);
    };
    reader.readAsDataURL(arquivo);
  } else {
    enviarReciclagem(agendamentoId, observacao, pontos, null, card, button);
  }
}

// Função auxiliar para envio de dados
function enviarReciclagem(id, observacao, pontos, imagemBase64, card, button) {
  const emailAdm = localStorage.getItem("email"); // <-- ADICIONADO

  fetch(`${API_URL}/api/reciclagem/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ observacao, pontos, imagem: imagemBase64, emailAdm }) // <-- ADICIONADO
  })

    .then(res => {
      if (!res.ok) throw new Error("Erro ao registrar reciclagem");
      return res.json();
    })
    .then(data => {
      mostrarMensagem("✅ " + data.message, "sucesso");
      card.style.opacity = "0.6";  // Faz o card desaparecer visualmente
      button.textContent = "Confirmado";
      setTimeout(() => {
        // Remover o agendamento da tela após um tempo
        card.remove();
      }, 2000);
    })
    .catch(() => {
      mostrarMensagem("❌ Erro ao registrar reciclagem. Tente novamente.", "erro");
      button.disabled = false;
      button.textContent = "Confirmar Coleta";
    });
}

// Função para indeferir a coleta
function indeferirColeta(agendamentoId, card, button) {
  const emailAdm = localStorage.getItem("email");

  if (!emailAdm) {
    mostrarMensagem("❌ E-mail do administrador não encontrado.", "erro");
    return;
  }

  const observacaoInput = card.querySelector(".observacao");
  const observacao = observacaoInput?.value.trim() || "Agendamento indeferido por motivo administrativo";

  button.disabled = true;
  button.textContent = "Indeferindo...";

  fetch(`${API_URL}/api/indeferir/${agendamentoId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ observacao, emailAdm }) // <-- ADICIONADO
})

    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message); });
      }
      return res.json();
    })
    .then(data => {
      mostrarMensagem("✅ " + data.message, "sucesso");
      card.style.opacity = "0.6";
      button.textContent = "Indeferido";
      button.disabled = true;
      setTimeout(() => {
        card.remove();
      }, 2000);
    })
    .catch((err) => {
      mostrarMensagem("❌ " + err.message, "erro");
      console.error("Erro ao indeferir:", err);
      button.disabled = false;
      button.textContent = "Indeferir Coleta";
    });
}




// Logout e limpeza de sessão
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Formulário para atribuir pontos diretamente
document.getElementById("formPontos").addEventListener("submit", (e) => {
  e.preventDefault();

  const emailAdm = localStorage.getItem("email");
  const emailUsuario = document.getElementById("emailUsuario").value.trim();
  const pontos = parseInt(document.getElementById("quantidadePontos").value);

  if (!emailUsuario || isNaN(pontos) || pontos <= 0) {
    mostrarMensagem("Preencha corretamente o email do usuário e a quantidade de pontos.", "aviso");
    return;
  }

  fetch(`${API_URL}/api/pontos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailAdm, emailUsuario, pontos })
  })
    .then(res => res.json())
    .then(data => {
      if (data.message?.includes("sucesso")) {
        mostrarMensagem("✅ " + data.message, "sucesso");
        document.getElementById("formPontos").reset();
      } else {
        mostrarMensagem("⚠️ " + data.message, "aviso");
      }
    })
    .catch(() => {
      mostrarMensagem("❌ Erro ao atribuir pontos. Verifique os dados.", "erro");
    });
});
