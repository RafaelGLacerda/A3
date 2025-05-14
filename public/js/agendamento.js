

const API_URL = "https://a3-2lsq.onrender.com";

    const recyclePoints = [
      { id: 1, name: "Limpurb Itaigara", lat: -12.9897037, lng: -38.4671861},
      { id: 2, name: "Limpurb Pirajá", lat: -12.8997581, lng: -38.4504567 },
      { id: 3, name: "Ecoponto Prefeitura de Salvador Alto da Terezinha", lat: -12.8804975, lng: -38.4747831 },
      { id: 4, name: "Cooperativa COOPERLIX Valéria", lat: -12.8827089, lng: -38.4393059 },
      { id: 5, name: "COOPERBRAVA São Marcos", lat: -12.9233244, lng: -38.4249531 },
      { id: 6, name: "COOPERES Ilha Amarela", lat: -12.8891411, lng: -38.469354 },
      { id: 7, name: "CANORE Santa Cruz", lat: -13.0027052, lng: -38.472826 },
      { id: 8, name: "Recicla Salvador Cidade Alta", lat: -12.9774484, lng: -38.4877508 },
      { id: 9, name: "Salvador Reciclagem Imbuí", lat: -12.96863, lng: -38.4273147 },
      { id: 10, name: "Solaris Reciclagem Fazenda Grande Do Retiro", lat: -12.9494532, lng: -38.4771619 }
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
  const imagemInput = document.getElementById('imagemReciclagem');

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
    const resposta = await fetch(`${API_URL}/api/agendamento/${encodeURIComponent(email)}`, {
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
