const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');  // Importa o CORS
const app = express();
const PORT = 3000;

const usersFilePath = path.join(__dirname, 'data', 'users.json');

// Middleware
app.use(cors());  // Ativa o CORS
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Função para ler dados do arquivo JSON
const readUsersData = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    console.log('Leitura de dados bem-sucedida:', data);
    return JSON.parse(data);
  } catch (err) {
    console.log('Erro ao ler o arquivo:', err);
    return [];
  }
};

// Função para salvar dados no arquivo JSON
const saveUsersData = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    console.log('Dados salvos com sucesso:', users);
  } catch (err) {
    console.log('Erro ao salvar os dados:', err);
  }
};

// Rota para login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const users = readUsersData();

  const user = users.find(u => u.email === email && u.senha === senha);

  if (user) {
    return res.status(200).json({ message: 'Login bem-sucedido' });
  } else {
    return res.status(401).json({ message: 'Email ou senha inválidos' });
  }
});

// Rota para cadastro
app.post('/api/cadastro', (req, res) => {
  const { nome, email, senha, cep, endereco } = req.body;
  const users = readUsersData();

  // Verifica se o email já existe
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Email já cadastrado' });
  }

  const newUser = { nome, email, senha, cep, endereco, quantidadeReciclada: 0 }; // Incluindo quantidade reciclada
  users.push(newUser);
  saveUsersData(users);

  res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
});

// Rota para pegar perfil do usuário
app.get('/profile/:email', (req, res) => {
  const email = req.params.email;
  const users = readUsersData();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  res.json(user);
});

// Rota para atualizar perfil do usuário (nome e/ou endereço)
// Atualizar nome ou endereço do usuário
app.put('/profile/:email', (req, res) => {
  const email = req.params.email;
  const { nome, endereco } = req.body;

  const users = readUsersData();
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  if (nome) users[userIndex].nome = nome;
  if (endereco) users[userIndex].endereco = endereco;

  saveUsersData(users);
  res.status(200).json({ message: 'Dados atualizados com sucesso' });
});


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
