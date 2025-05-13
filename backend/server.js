const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const usersFilePath = path.join(__dirname, 'data', 'users.json');

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Função para ler os dados do JSON
const readUsersData = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler o arquivo:', err);
    return [];
  }
};

// Função para salvar os dados no JSON
const saveUsersData = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Erro ao salvar os dados:', err);
  }
};

// Rota de login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const users = readUsersData();

  const user = users.find(u => u.email === email && u.senha === senha);
  if (user) {
    res.status(200).json({ message: 'Login bem-sucedido' });
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

  const newUser = {
    nome,
    email,
    senha,
    cep,
    endereco,
    quantidadeReciclada: 0,
    agendamentos: []
  };

  users.push(newUser);
  saveUsersData(users);

  res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
});

app.get('/profile/:email', (req, res) => {
  const email = req.params.email;
  console.log("Buscando perfil para:", email); // <---- debug

  const users = readUsersData();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  res.json(user);
});


// Rota para atualizar perfil
app.put('/profile/:email', (req, res) => {
  const { email } = req.params;
  const { nome, endereco } = req.body;

  const users = readUsersData();
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  if (nome) users[userIndex].nome = nome;
  if (endereco) users[userIndex].endereco = endereco;

  saveUsersData(users);
  res.json({ message: 'Perfil atualizado com sucesso' });
});

// Rota para criar agendamento
app.post('/api/agendamento/:email', (req, res) => {
  const email = req.params.email;
  const { nome, data, hora, cep, cooperativa } = req.body;

  if (!nome || !data || !hora || !cep || !cooperativa) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios para o agendamento.' });
  }

  const users = readUsersData(); // função que lê o JSON
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  if (!Array.isArray(user.agendamentos)) {
    user.agendamentos = [];
  }

  user.agendamentos.push({ nome, data, hora, cep, cooperativa });
  saveUsersData(users);
  res.status(200).json({ message: 'Agendamento realizado com sucesso' });
});

// Rota para obter agendamentos de um usuário
app.get('/api/agendamentos/:email', (req, res) => {
  const email = req.params.email;
  const users = readUsersData();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  res.json(user.agendamentos || []);
});

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
