# ♻️ Projeto de Agendamento de Coletas - A3

### 🌐 Acesse o site online
🔗 https://reciclassa.onrender.com/

---

# 🧾 Como Funciona de Maneira Geral 🔥

## Tela Inicial
- A primeira tela contém a opção de **login/cadastro**.
- **Atenção**: é permitido **apenas um CPF por conta**.
- Os e-mails podem ser variados (Gmail, iCloud, Outlook, etc.).

## Após o Login
- Você verá a **tela de boas-vindas**, com informações sobre o site e empresas parceiras (incluindo seus links de acesso).
- Uma **barra lateral de navegação** estará disponível com os seguintes itens:

### 🧭 Barra de Navegação
- **Início**: Tela de boas-vindas.
- **Perfil**: Visualize e edite suas informações (nome e/ou endereço).
- **Como Funciona**: Explicação sobre o funcionamento da plataforma.
- **Conscientização**: Conteúdos voltados ao meio ambiente.
- **Mapa**: Mapa de Salvador com as cooperativas marcadas.
- **Prêmios**: Visualize os prêmios disponíveis, o valor necessário para resgate e as imagens dos prêmios.
- **Agendamento**: Agende a coleta dos seus recicláveis.
- **Ver Agendamentos**: Veja todos os seus agendamentos, detalhes completos e possibilidade de contato com a cooperativa via WhatsApp.

---

## 👨‍💼 Acesso ADM
- O login como **ADM** é restrito a contas criadas pela própria empresa.
- Funções do ADM:
  - Administrar pontuação das coletas.
  - Salvar códigos de resgate de prêmios.
  - Visualizar histórico de agendamentos e pontuações.
  - Confirmar ou indeferir agendamentos.
  - Inserir recados e imagens nas coletas.

### 🧪 Conta ADM de Exemplo (teste)
- **Email**: `JoaoADM@cooperativas.com.br`  
- **Senha**: `admin123`

---

## ⚙️ Funcionamento na Prática

1. Crie sua conta.
2. No menu **Perfil**, caso precise, edite seu nome e endereço (o endereço é essencial para as coletas).
3. Acesse **Agendamento** e escolha data e horário disponíveis para coleta, e caso queira, uma imagem da reciclagem.
4. Após agendar, vá até **Ver Agendamentos**.
5. É **recomendado** entrar em contato com a cooperativa via WhatsApp para confirmar o agendamento (contato no ver agendamentos).
6. O ADM visualizará o agendamento e poderá **confirmar** ou **indeferir**.
7. Se confirmado, o ADM:
   - Adicionará os pontos referentes à coleta.
   - Poderá adicionar recados e imagens.

---

## 🎁 Resgate de Prêmios

- Com os pontos acumulados, vá até a aba **Prêmios**.
- Escolha o prêmio desejado.
- Ao selecionar, você receberá um **código de resgate**.
- Vá até a cooperativa mais próxima e apresente o código.
- O ADM:
  - Verificará se o código já foi utilizado.
  - Se não, validará e salvará o código, impedindo novo uso.

---

✅ **Importante**: todo o processo é gratuito e voltado à sustentabilidade e incentivo à reciclagem nas comunidades!



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

