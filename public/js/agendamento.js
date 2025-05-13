 // Carrega a sidebar
    fetch("sidebar.html")
      .then(res => res.text())
      .then(html => {
        document.getElementById("sidebar-container").innerHTML = html;
      });

const API_URL = "https://a3-2lsq.onrender.com";

const recyclePoints = [
  { id: 1, name: "Campo Grande", lat: -12.988572736686292, lng: -38.520103895353984 },
  { id: 2, name: "Ondina", lat: -13.0115, lng: -38.4995 },
  { id: 3, name: "Rio Vermelho", lat: -13.0102, lng: -38.4866 },
  { id: 4, name: "Brotas", lat: -12.985138018320063, lng: -38.501248250615475 },
  { id: 5, name: "Pituba", lat: -13.000812913502605, lng: -38.45969249204836 },
  { id: 6, name: "Pernambués", lat: -12.972252437839018, lng: -38.461392333116734 },
  { id: 7, name: "Imbuí", lat: -12.970897156797012, lng: -38.43489105185892 },
  { id: 8, name: "Sussuarana", lat: -12.933550563139878, lng: -38.444129692500596 },
  { id: 9, name: "São Cristóvão", lat: -12.91040561999883, lng: -38.353779377995345 },
  { id: 10, name: "Cajazeiras", lat: -12.899468912209896, lng: -38.4077516879381 }
];

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function buscarCoordenadasPorCEP(cep) {
  const viaCepResp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const viaCepData = await viaCepResp.json();

  if (viaCepData.erro) {
    throw new Error("CEP não encontrado no ViaCEP.");
  }

  const tentativas = [
    `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`,
    `${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`,
    `${viaCepData.localidade}, ${viaCepData.uf}, Brasil`
  ];

  for (const endereco of tentativas) {
    const nominatimResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`);
    const nominatimData = await nominatimResp.json();

    if (nominatimData.length > 0) {
      return {
        lat: parseFloat(nominatimData[0].lat),
        lng: parseFloat(nominatimData[0].lon)
      };
    }
  }

  throw new Error("Coordenadas não encontradas para esse CEP.");
}

document.getElementById('btnBuscarColeta').addEventListener('click', async function () {
  const cep = document.getElementById('cep').value.replace(/\D/g, '');
  const mensagemDiv = document.getElementById('mensagemAgendamento');

  if (cep.length !== 8) {
    alert("CEP inválido. Digite um CEP com 8 números.");
    return;
  }

  mensagemDiv.textContent = "Buscando cooperativa mais próxima...";
  mensagemDiv.style.color = "black";

  try {
    const { lat, lng } = await buscarCoordenadasPorCEP(cep);
    let menorDistancia = Infinity;
    let pontoMaisProximo = null;

    for (const ponto of recyclePoints) {
      const distancia = calcularDistancia(lat, lng, ponto.lat, ponto.lng);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        pontoMaisProximo = ponto;
      }
    }

    if (pontoMaisProximo) {
      document.getElementById('cooperativaSelecionada').value = pontoMaisProximo.name;
      mensagemDiv.innerHTML = `♻️ Cooperativa mais próxima: <strong>${pontoMaisProximo.name}</strong><br>Distância estimada: <strong>${menorDistancia.toFixed(2)} km</strong>`;
      mensagemDiv.style.color = "blue";
    } else {
      mensagemDiv.textContent = "Nenhum ponto de coleta encontrado.";
      mensagemDiv.style.color = "red";
    }
  } catch (err) {
    mensagemDiv.textContent = "Erro ao buscar CEP: " + err.message;
    mensagemDiv.style.color = "red";
  }
});

document.getElementById('form-agendamento').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = localStorage.getItem('email');
  const mensagemDiv = document.getElementById('mensagemAgendamento');

  if (!email) {
    alert("Usuário não está logado.");
    return;
  }

  const nome = document.getElementById('nomeRepresentante').value;
  const data = document.getElementById('dataColeta').value;
  const hora = document.getElementById('horaColeta').value;
  const cep = document.getElementById('cep').value;
  const cooperativa = document.getElementById('cooperativaSelecionada').value;
  const imagemInput = document.getElementById('imagemMaterial');

  if (!cooperativa) {
    alert("Por favor, clique em 'Buscar Coleta Mais Próxima' antes de agendar.");
    return;
  }

  let imagemBase64 = '';
  if (imagemInput.files && imagemInput.files[0]) {
    const file = imagemInput.files[0];
    imagemBase64 = await toBase64(file);
  }

  try {
    const resposta = await fetch(`/api/agendamento/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, data, hora, cep, cooperativa, imagem: imagemBase64 })
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      mensagemDiv.textContent = "✅ Agendamento concluído!";
      mensagemDiv.style.color = "green";
      document.getElementById('form-agendamento').reset();
      document.getElementById('cooperativaSelecionada').value = '';
    } else {
      mensagemDiv.textContent = "❌ Erro ao agendar: " + (resultado.message || "Erro desconhecido.");
      mensagemDiv.style.color = "red";
    }
  } catch (error) {
    mensagemDiv.textContent = "❌ Erro ao conectar com o servidor.";
    mensagemDiv.style.color = "red";
  }
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); // resultado inclui o tipo + base64
    reader.onerror = error => reject(error);
  });
}
