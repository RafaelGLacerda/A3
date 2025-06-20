const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

const usersFilePath = path.join(__dirname, 'data', 'users.json');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, '..', 'public')));

const readUsersData = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveUsersData = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const users = readUsersData();
  const user = users.find(u => u.email === email && u.senha === senha);

  if (user) {
    res.status(200).json({ message: 'Login bem-sucedido', tipo: user.tipo });
  } else {
    res.status(401).json({ message: 'Email ou senha inválidos' });
  }
});

// Função para validar CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0, resto;

  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(cpf[10]);
}

// Rota de cadastro
app.post('/api/cadastro', (req, res) => {
  const { nome, cpf, email, senha, cep, endereco } = req.body;

  // Validação básica
  if (!cpf) {
    return res.status(400).json({ message: 'CPF é obrigatório.' });
  }

  if (!validarCPF(cpf)) {
    return res.status(400).json({ message: 'CPF inválido.' });
  }

  const users = readUsersData();

  if (users.some(u => u.cpf === cpf)) {
    return res.status(400).json({ message: 'CPF já cadastrado' });
  }

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Email já cadastrado' });
  }

  if (email.toLowerCase().includes('adm@cooperativas.com.br')) {
    return res.status(403).json({ message: 'Não é possível cadastrar administradores.' });
  }

  const novoUsuario = {
    nome,
    cpf,
    email,
    senha,
    cep,
    endereco,
    tipo: 'USER',
    quantidadeReciclada: 0,
    pontos: 0,
    agendamentos: [],
    resgatados: []
  };

  users.push(novoUsuario);
  saveUsersData(users);

  res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
});


// Visualizar perfil
app.get('/profile/:email', (req, res) => {
  const { email } = req.params;
  const users = readUsersData();
  const user = users.find(u => u.email === email);

  user
    ? res.json(user)
    : res.status(404).json({ message: 'Usuário não encontrado' });
});

// Atualizar perfil
app.put('/profile/:email', (req, res) => {
  const { email } = req.params;
  const { nome, endereco } = req.body;
  const users = readUsersData();
  const index = users.findIndex(u => u.email === email);

  if (index === -1) return res.status(404).json({ message: 'Usuário não encontrado' });

  if (nome) users[index].nome = nome;
  if (endereco) users[index].endereco = endereco;

  saveUsersData(users);
  res.json({ message: 'Perfil atualizado com sucesso' });
});

// Agendamento
app.post('/api/agendamento/:email', (req, res) => {
  const { email } = req.params;
  const { nome, data, hora, cep, cooperativa, imagem } = req.body;

  if (!nome || !data || !hora || !cep || !cooperativa) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const users = readUsersData();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  let imagemUrl = '';
  if (imagem) {
    const base64Data = imagem.split(';base64,').pop();
    const imagemPath = path.join(uploadsDir, `${uuidv4()}.png`);
    fs.writeFileSync(imagemPath, base64Data, { encoding: 'base64' });
    imagemUrl = `/uploads/${path.basename(imagemPath)}`;
  }

  const novoAgendamento = {
    id: uuidv4(),
    nome,
    data,
    hora,
    cep,
    cooperativa,
    status: 'pendente',
    comentarioAdm: '',
    imagem: imagemUrl
  };

  user.agendamentos.push(novoAgendamento);
  saveUsersData(users);
  res.status(200).json({ message: 'Agendamento realizado com sucesso' });
});

// Listar agendamentos do usuário
app.get('/api/agendamentos/:email', (req, res) => {
  const { email } = req.params;
  const users = readUsersData();
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  res.json(user.agendamentos || []);
});

// Listar todos agendamentos (ADM)
app.get('/api/agendamentos', (req, res) => {
  const users = readUsersData();
  const todosAgendamentos = users.flatMap(user =>
    (user.agendamentos || []).map(ag => ({
      ...ag,
      emailUsuario: user.email,
      enderecoUsuario: user.endereco // <--- adicionando endereço
    }))
  );
  res.json(todosAgendamentos);
});

// Registrar reciclagem
app.put('/api/reciclagem/:id', (req, res) => {
  const { id } = req.params;
  const { observacao, pontos, imagem } = req.body;
  const users = readUsersData();

  if (!observacao || pontos === undefined || isNaN(Number(pontos))) {
    return res.status(400).json({ message: 'Observação e pontos válidos são obrigatórios.' });
  }

  let imagemUrl = '';
  if (imagem) {
    const base64Data = imagem.split(';base64,').pop();
    const imagemPath = path.join(uploadsDir, `${uuidv4()}.png`);
    fs.writeFileSync(imagemPath, base64Data, { encoding: 'base64' });
    imagemUrl = `/uploads/${path.basename(imagemPath)}`;
  }

  let atualizado = false;

  users.forEach(user => {
    const agendamento = user.agendamentos?.find(ag => ag.id === id);
    if (agendamento) {
      agendamento.comentarioAdm = observacao;
      agendamento.pontos = Number(pontos);
      agendamento.status = 'realizado';
      if (imagemUrl) agendamento.imagem = imagemUrl;
      user.pontos = (user.pontos || 0) + agendamento.pontos;
      const admin = users.find(u => u.tipo === 'ADM' && u.email === req.body.emailAdm); // se você passar esse dado no front

    if (admin) {
      if (!admin.historicoAdm) admin.historicoAdm = [];
      admin.historicoAdm.push({
  tipo: 'Reciclagem validada',
  agendamentoId: id,
  destinatario: user.email,
  observacao,
  pontos: Number(pontos),
  data: new Date().toISOString()
});

}

      atualizado = true;
      
    }
  });

  if (!atualizado) {
    return res.status(404).json({ message: 'Agendamento não encontrado' });
  }

  saveUsersData(users);
  res.json({ message: 'Reciclagem registrada com sucesso' });
});

// Excluir agendamento
app.delete('/api/agendamentos/:id', (req, res) => {
  const { id } = req.params;
  const { email } = req.body;  // Recebendo o email do corpo da requisição
  const users = readUsersData();
  let encontrado = false;

  users.forEach(user => {
    if (user.email === email) {  // Verifica se o email corresponde ao usuário
      const original = user.agendamentos.length;
      user.agendamentos = user.agendamentos.filter(ag => ag.id !== id);  // Exclui o agendamento pelo ID
      if (user.agendamentos.length < original) {
        encontrado = true;  // Marca como encontrado se a exclusão ocorreu
      }
    }
  });

  if (!encontrado) {
    return res.status(404).json({ message: 'Agendamento não encontrado' });  // Caso o agendamento não tenha sido encontrado
  }

  saveUsersData(users);  // Salva as alterações no arquivo
  res.json({ message: 'Agendamento excluído com sucesso' });  // Retorna sucesso
});

// Adicionar pontos (ADM)
app.post('/api/pontos', (req, res) => {
  const { emailAdm, emailUsuario, pontos } = req.body;
  const users = readUsersData();

  const adm = users.find(u => u.email === emailAdm && u.tipo === 'ADM');
  if (!adm) return res.status(403).json({ message: 'Apenas administradores podem distribuir pontos.' });

  const usuario = users.find(u => u.email === emailUsuario);
  if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });
  if (usuario.tipo === 'ADM') return res.status(400).json({ message: 'Você não pode adicionar pontos a outro ADM.' });

  const valor = Number(pontos);
usuario.pontos = (usuario.pontos || 0) + valor;

if (!adm.historicoAdm) adm.historicoAdm = [];
adm.historicoAdm.push({
  tipo: 'Adição de pontos',
  destinatario: emailUsuario,
  valor,
  data: new Date().toISOString()
});

  saveUsersData(users);

  res.json({ message: `Pontos adicionados com sucesso. Total: ${usuario.pontos}` });
});

// ✅ Nova rota: resgatar prêmio
app.post('/api/resgatar-premio', (req, res) => {
  const { email, nomePremio, codigo, custo } = req.body;

  if (!email || !nomePremio || !codigo || !custo) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }

  const users = readUsersData();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

  if (!user.resgatados) user.resgatados = [];

  const jaResgatado = user.resgatados.find(r => r.codigo === codigo);
  if (jaResgatado) {
    return res.status(400).json({ message: 'Código já resgatado.' });
  }

  if (user.pontos < custo) {
    return res.status(400).json({ message: 'Pontos insuficientes.' });
  }

  user.pontos -= custo;
  user.resgatados.push({ nome: nomePremio, codigo, data: new Date().toISOString(), custo });
  saveUsersData(users);

  res.json({ message: 'Prêmio resgatado com sucesso!', resgatados: user.resgatados });
});
// ✅ Nova rota: listar prêmios resgatados por usuário
app.get('/resgatados/:email', (req, res) => {
  const { email } = req.params;
  const users = readUsersData();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  res.json(user.resgatados || []);
});



app.put('/api/indeferir/:id', (req, res) => {
  const { id } = req.params;
  const { observacao } = req.body;

  console.log(`Indeferindo agendamento com ID: ${id}`);
  const users = readUsersData();
  let encontrado = false;

  users.forEach(user => {
    const agendamento = user.agendamentos?.find(ag => ag.id === id);
    if (agendamento && agendamento.status !== 'realizado') {
      agendamento.status = 'indeferido';
      const admin = users.find(u => u.tipo === 'ADM' && u.email === req.body.emailAdm); // se for passado

if (admin) {
  if (!admin.historicoAdm) admin.historicoAdm = [];
  admin.historicoAdm.push({
  tipo: 'Agendamento indeferido',
  agendamentoId: id,
  destinatario: user.email,
  observacao,
  data: new Date().toISOString()
});

}

      agendamento.comentarioAdm = observacao || 'Indeferido sem observação';
      encontrado = true;
    }
  });

  if (!encontrado) {
    console.log('Agendamento não encontrado ou já realizado');
    return res.status(404).json({ message: 'Agendamento não encontrado ou já realizado' });
  }

  saveUsersData(users);
  console.log('Agendamento indeferido com sucesso');
  res.json({ message: 'Agendamento indeferido com sucesso' });
});

app.get('/api/historico/:emailAdm', (req, res) => {
  const { emailAdm } = req.params;
  const users = readUsersData();
  const adm = users.find(u => u.email === emailAdm && u.tipo === 'ADM');

  if (!adm) {
    return res.status(404).json({ message: 'Administrador não encontrado.' });
  }

  res.json(adm.historicoAdm || []);
});



// Inicializar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
