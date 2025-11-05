# Aplicativo-Odontologico
Repositório destinado a elaboração do projeto do aplicativo de assistência odontológica

# 🦷 OdontoPlay – Jogo Interativo e Diagnóstico Bucal Inteligente  

OdontoPlay é um aplicativo web interativo que une **diversão e conscientização em saúde bucal**.  
O projeto combina **reconhecimento facial**, **gamificação**, e **inteligência de triagem odontológica** para incentivar bons hábitos de higiene e facilitar o acesso a dentistas próximos.

---

## 💡 Visão Geral  

O app possui **duas interfaces principais**:

1. 🎮 **Jogo Interativo (Reconhecimento Facial)**  
   O usuário abre a boca e vê “germezinhos” aparecendo na tela.  
   Ele deve “matar” os germes com movimentos ou cliques, ganhando pontos que são salvos em seu perfil.  

2. 🩺 **Questionário de Saúde Bucal + Diagnóstico Preliminar**  
   Um questionário rápido filtra possíveis condições odontológicas (como gengivite ou cárie) e mostra, com base na localização do usuário, os **dentistas mais próximos**.

Além disso, o aplicativo conta com:
- 👤 **Página de Login / Cadastro**  
- 🏅 **Página de Perfil** (exibe pontuação total e histórico de jogos)  

---

## 🧠 Tecnologias Utilizadas  

| Camada | Tecnologias |
|:-------|:-------------|
| **Frontend** | JavaScript / React / TensorFlow.js / HTML5 Canvas |
| **Backend** | Python / FastAPI |
| **Banco de Dados** | PostgreSQL (SQLAlchemy + Alembic) |
| **Autenticação** | JWT (JSON Web Token) |
| **Geolocalização** | Google Places API / Nominatim (OpenStreetMap) |
| **Deploy** | Docker / Render / Heroku / AWS |

---

## ⚙️ Arquitetura Simplificada  

Frontend (React + TF.js)
↓
Backend (FastAPI)
↓
Banco de Dados (PostgreSQL)
↓
APIs externas (Google Places / OSM)

---

## 📱 Estrutura do Aplicativo  

### 1️⃣ Login e Cadastro  
- Registro de novos usuários com e-mail e senha (hash segura).  
- Login com JWT e proteção por HTTPS.  

### 2️⃣ Perfil do Usuário  
- Exibe pontuação total e conquistas (badges).  
- Histórico de partidas e progresso.  

### 3️⃣ Jogo de Reconhecimento Facial  
- Usa a webcam e o modelo **MediaPipe / TensorFlow.js** para detectar o rosto.  
- Quando a boca é aberta, aparecem “germes” dentro da área detectada.  
- O usuário interage clicando neles para eliminá-los.  

### 4️⃣ Questionário de Saúde Bucal  
- Perguntas dinâmicas sobre sintomas e hábitos.  
- Retorna **possíveis diagnósticos** com base em regras clínicas simples.  
- Ao final, mostra **dentistas próximos** usando a localização do usuário.
- https://www.figma.com/design/QXaOIFaPvNi60YzZM3WBdk?node-id=176%3A7&type=design&fuid=1059621041559645209#877817134 

---

## 🗂️ Estrutura do Projeto  

<img width="134" height="332" alt="image" src="https://github.com/user-attachments/assets/bfb18b20-ebf8-42a3-9f40-1c903c7f8879" />


---

## Contribuições são super bem-vindas! 💬
Siga os passos:

1. Faça um fork do projeto

2. Crie uma branch: git checkout -b minha-feature

3. Commit suas mudanças: git commit -m 'Adiciona nova feature'

4. Envie o PR: git push origin minha-feature



