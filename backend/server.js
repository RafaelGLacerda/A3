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

// Funções utilitárias
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

// Rota de login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const users = readUsersData();

  const user = users.find(u => u.email === email && u.senha === senha);
  if (user) {
    const tipo = user.tipo === 'ADM' ? 'ADM' : 'USER';
    res.status(200).json({ message: 'Login bem-sucedido', tipo });
  } else {
    res.status(401).json({ message: 'Email ou senha inválidos' });
  }
});

// Rota de cadastro
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

// Obter perfil
app.get('/profile/:email', (req, res) => {
  const email = req.params.email;
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

  if (index === -1) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  if (nome) users[index].nome = nome;
  if (endereco) users[index].endereco = endereco;

  saveUsersData(users);
  res.json({ message: 'Perfil atualizado com sucesso' });
});

// Criar agendamento
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

// Obter agendamentos do usuário
app.get('/api/agendamentos/:email', (req, res) => {
  const email = req.params.email;
  const users = readUsersData();
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  res.json(user.agendamentos || []);
});

// Obter todos os agendamentos (para ADM)
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

// Registrar reciclagem (ADM marca como feita)
app.put('/api/reciclagem/:id', (req, res) => {
  const { id } = req.params;
  const { observacao, pontos } = req.body;
  const users = readUsersData();

  let agendamentoAtualizado = null;

  users.forEach(user => {
    user.agendamentos = user.agendamentos.map(ag => {
      if (ag.id === id) {
        ag.observacao = observacao;
        ag.pontos = Number(pontos) || 0;
        user.pontos = (user.pontos || 0) + ag.pontos;
        agendamentoAtualizado = ag;
      }
      return ag;
    });
  });

  if (!agendamentoAtualizado) {
    return res.status(404).json({ message: 'Agendamento não encontrado' });
  }

  saveUsersData(users);
  res.json({ message: 'Reciclagem registrada com sucesso' });
});

// Excluir agendamento (desistir da coleta)
app.delete('/api/agendamentos/:id', (req, res) => {
  const agendamentoId = req.params.id;
  const users = readUsersData();

  let encontrado = false;

  users.forEach(user => {
    if (Array.isArray(user.agendamentos)) {
      const agendamentosAntes = user.agendamentos.length;
      user.agendamentos = user.agendamentos.filter(ag => ag.id !== agendamentoId);
      if (user.agendamentos.length < agendamentosAntes) {
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
