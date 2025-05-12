const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const usersFilePath = path.join(__dirname, 'data', 'users.json');

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Funções auxiliares
const readUsers = () => {
  if (!fs.existsSync(usersFilePath)) return [];
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Erro ao ler users.json:', error);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erro ao escrever no users.json:', error);
  }
};

// ROTAS

// Cadastro de usuário
app.post('/api/cadastro', (req, res) => {
  const { nome, email, senha, cep, endereco } = req.body;

  if (!nome || !email || !senha || !cep || !endereco) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
  }

  const users = readUsers();
  const userExists = users.find(u => u.email === email);

  if (userExists) {
    return res.status(400).json({ message: 'Email já cadastrado.' });
  }

  const novoUsuario = {
    nome,
    email,
    senha,
    cep,
    endereco,
    quantidadeReciclada: 0,
    agendamentos: []
  };

  users.push(novoUsuario);
  writeUsers(users);

  res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
});

// Login de usuário
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const users = readUsers();

  const user = users.find(u => u.email === email && u.senha === senha);

  if (!user) {
    return res.status(401).json({ message: 'Email ou senha inválidos.' });
  }

  res.json({ message: 'Login bem-sucedido', email: user.email });
});

// Obter perfil
app.get('/api/perfil/:email', (req, res) => {
  const { email } = req.params;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

  // Não retornar senha
  const { senha, ...userData } = user;
  res.json(userData);
});

// Atualizar perfil
app.put('/api/perfil/:email', (req, res) => {
  const { nome, endereco } = req.body;
  const users = readUsers();
  const index = users.findIndex(u => u.email === req.params.email);

  if (index === -1) return res.status(404).json({ message: 'Usuário não encontrado.' });

  if (nome) users[index].nome = nome;
  if (endereco) users[index].endereco = endereco;

  writeUsers(users);
  res.json({ message: 'Perfil atualizado com sucesso!' });
});

// Criar agendamento
// Agendar coleta (corrigido com nome do representante)
app.post('/api/agendar/:email', (req, res) => {
  const { email } = req.params;
  const { nome, data, hora, cep, cooperativa } = req.body;

  if (!nome || !data || !hora || !cep || !cooperativa) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  const novoAgendamento = { nome, data, hora, cep, cooperativa };
  user.agendamentos.push(novoAgendamento);
  writeUsers(users);

  console.log(`📅 Novo agendamento salvo para ${email}:`, novoAgendamento);
  res.json({ message: 'Agendamento salvo com sucesso' });
});


// Listar agendamentos do usuário
app.get('/api/agendamentos/:email', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.email === req.params.email);

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

  res.json(user.agendamentos || []);
});

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
