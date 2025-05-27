# ♻️ Projeto de Agendamento de Coletas - A3

## 🚀 Como rodar o projeto

### 🌐 Acesse o site online
🔗 https://a3-2lsq.onrender.com/

---

### 💻 Sobre o projeto

Este é um site interativo voltado para o agendamento de coletas de recicláveis. O sistema possui funcionalidades para **usuários comuns** e **contas administrativas (ADM)**, cada um com permissões específicas.

#### ✅ Funcionalidades para usuários:

- Cadastro e login
- Tela inicial com barra lateral contendo:
- **Perfil:** visualizar e editar dados
- **Como funciona?:** explicação sobre o funcionamento da plataforma
- **Conscientização:** dicas e informações sobre reciclagem
- **Mapa:** visualização de pontos de coleta e cooperativas próximas
- **Prêmios:** visualização e troca de pontos acumulados
- **Agendamento:** permite escolher data e local para coleta, com base na cooperativa mais próxima do CEP informado
- **Ver agendamentos:** consulta de status, detalhes e possibilidade de exclusão dos agendamentos

Após a confirmação da coleta por um ADM, o usuário poderá visualizar:
- O **status atualizado**
- Uma **imagem enviada pelo ADM**
- Um **comentário do ADM**
- A **quantidade de pontos recebida**, que pode ser trocada por prêmios
- Uma conta ADM de exemplo para acesso popular "email": "JoaoADM@cooperativas.com.br", "senha": "admin123"

---

#### 🛠️ Funcionalidades para contas ADM:

- Visualização de todas as coletas solicitadas
- Confirmação das coletas com:
  - Marcação como **"Coleta Realizada"**
  - Comentário personalizado
  - Imagem da coleta
  - Pontuação atribuída ao usuário

> ⚠️ Contas ADM são exclusivas e **não podem ser criadas via site**.

---

### 📦 Como rodar o projeto localmente

```bash
# Clone o repositório
git clone https://github.com/RafaelGLacerda/A3.git

# Acesse a pasta do projeto
cd A3

# Vá para a pasta do backend
cd backend

# Instale as dependências
npm install

# Inicie o servidor
node server.js
```

---

