const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Simulação de Banco de Dados (Memória)
const users = []; 

// Rota de Login
app.post('/api/login', (req, res) => {
    // 1. CORREÇÃO: Verifica se é convidado PRIMEIRO
    if (req.body.guest) {
        return res.json({ nome: 'Convidado', cpf: 'guest', guest: true });
    }

    const { nome, cpf } = req.body;

    // 2. Só depois valida se tem nome e cpf (para usuários normais)
    if (!nome || !cpf) {
        return res.status(400).json({ error: 'Dados inválidos. Nome e CPF são obrigatórios.' });
    }

    let user = users.find(u => u.cpf === cpf);
    if (!user) {
        // Cria usuário novo se não existir
        user = { id: Date.now(), nome, cpf, level: 1, coins: 0, badges: [] };
        users.push(user);
    }
    return res.json(user);
});

// Rota de Perfil
app.get('/api/users/:cpf', (req, res) => {
    const { cpf } = req.params;
    
    // Tratamento especial para o perfil do convidado
    if (cpf === 'guest') {
         return res.json({ nome: 'Convidado', points: 0, badges: [], guest: true });
    }
    
    const user = users.find(u => u.cpf === cpf);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    return res.json(user);
});

app.listen(3000, () => console.log('Servidor Back ON na porta 3000'));