const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Configurar variáveis de ambiente
dotenv.config();

const app = express();

// Permitir CORS para comunicação entre frontend e backend
app.use(cors());

// Configurar o Express para entender JSON
app.use(express.json());

// Rota simples de teste
app.get('/', (req, res) => {
  res.send('Servidor backend rodando!');
});

// Defina a porta do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
