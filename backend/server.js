const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

const usersFilePath = path.join(__dirname, 'data', 'users.json');

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Utils
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

// ROTAS

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

// Cadastro
app.post('/api/cadastro', (req, res) => {
  const { nome, email, senha, cep, endereco } = req.body;
  const users = readUsersData();

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Email já cadastrado' });
  }

  if (email.includes('ADM@cooperativas.com.br')) {
    return res.status(403).json({ message: 'Não é possível cadastrar administradores.' });
  }

  const novoUsuario = {
    nome,
    email,
    senha,
    cep,
    endereco,
    tipo: 'USER',
    quantidadeReciclada: 0,
    pontos: 0,
    agendamentos: []
  };

  users.push(novoUsuario);
  saveUsersData(users);
  res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
});

// Perfil - visualizar
app.get('/profile/:email', (req, res) => {
  const { email } = req.params;
  const users = readUsersData();
  const user = users.find(u => u.email === email);

  user
    ? res.json(user)
    : res.status(404).json({ message: 'Usuário não encontrado' });
});

// Perfil - atualizar
app.put('/profile/:email', (req, res) => {
  const { email } = req.params;
  const { nome, endereco } = req.body;
  const users = readUsersData();
  const index = users.findIndex(u => u.email === email);

  if (index === -1) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  if (nome) users[index].nome = nome;
  if (endereco) users[index].endereco = endereco;

  saveUsersData(users);
  res.json({ message: 'Perfil atualizado com sucesso' });
});

// Agendamento - criar
app.post('/api/agendamento/:email', (req, res) => {
  const { email } = req.params;
  const { nome, data, hora, cep, cooperativa } = req.body;

  if (!nome || !data || !hora || !cep || !cooperativa) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const users = readUsersData();
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  const novoAgendamento = {
    id: uuidv4(),
    nome,
    data,
    hora,
    cep,
    cooperativa
  };

  user.agendamentos.push(novoAgendamento);
  saveUsersData(users);
  res.status(200).json({ message: 'Agendamento realizado com sucesso' });
});

// Agendamentos - por usuário
app.get('/api/agendamentos/:email', (req, res) => {
  const { email } = req.params;
  const users = readUsersData();
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  res.json(user.agendamentos || []);
});

// Agendamentos - todos (ADM)
app.get('/api/agendamentos', (req, res) => {
  const users = readUsersData();

  const todosAgendamentos = users.flatMap(user =>
    user.agendamentos?.map(ag => ({
      ...ag,
      emailUsuario: user.email
    })) || []
  );

  res.json(todosAgendamentos);
});

// Reciclagem - registrar (ADM)
app.put('/api/reciclagem/:id', (req, res) => {
  const { id } = req.params;
  const { observacao, pontos } = req.body;
  const users = readUsersData();

  if (!observacao || pontos === undefined || isNaN(Number(pontos))) {
    return res.status(400).json({ message: 'Observação e pontos válidos são obrigatórios.' });
  }

  let agendamentoAtualizado = false;

  users.forEach(user => {
    const agendamento = user.agendamentos?.find(ag => ag.id === id);

    if (agendamento) {
      agendamento.observacao = observacao;
      agendamento.pontos = Number(pontos);
      user.pontos = (user.pontos || 0) + agendamento.pontos;
      agendamentoAtualizado = true;
    }
  });

  if (!agendamentoAtualizado) {
    return res.status(404).json({ message: 'Agendamento não encontrado' });
  }

  saveUsersData(users);
  res.json({ message: 'Reciclagem registrada com sucesso' });
});

// Agendamento - excluir
app.delete('/api/agendamentos/:id', (req, res) => {
  const { id } = req.params;
  const users = readUsersData();
  let encontrado = false;

  users.forEach(user => {
    if (Array.isArray(user.agendamentos)) {
      const inicial = user.agendamentos.length;
      user.agendamentos = user.agendamentos.filter(ag => ag.id !== id);
      if (user.agendamentos.length < inicial) {
        encontrado = true;
      }
    }
  });

  if (!encontrado) {
    return res.status(404).json({ message: 'Agendamento não encontrado' });
  }

  saveUsersData(users);
  res.json({ message: 'Agendamento excluído com sucesso' });
});

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
