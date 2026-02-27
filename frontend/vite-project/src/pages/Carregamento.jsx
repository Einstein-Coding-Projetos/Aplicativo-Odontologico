import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import personagem1 from '../assets/monstro_transparente.png';  // Importando o personagem

function Carregamento() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [fraseAleatoria, setFraseAleatoria] = useState("");
  const [dots, setDots] = useState(".");

  // Array com frases aleatórias
  const frases = [
    "Quero ver você conseguir nos destruir!💣💥",
    "Segura, já estamos quase lá!💡",
    "Vamos ver se você é bom mesmo!👊💥",
    "Uma grande jornada te aguarda!🥇"
  ];

  // Função para escolher uma frase aleatória
  const escolherFrase = () => {
    const frase = frases[Math.floor(Math.random() * frases.length)];
    setFraseAleatoria(frase);
  };

  // Atualizando a frase a cada 3 segundos
  useEffect(() => {
    escolherFrase();
    const intervalFrase = setInterval(() => {
      escolherFrase();
    }, 3000);

    return () => clearInterval(intervalFrase);
  }, []);

  // Para os três pontos dinâmicos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return ".";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const duration = 5000;  // Total de 5 segundos
    const increment = 100 / (duration / 100);

    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          navigate('/home');
          return oldProgress;
        }
        return Math.min(oldProgress + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="carregamento-page">
      <style>{css}</style>

      <div className="wrap">
        <header className="headline">
          <h1>Carregando{dots}</h1>
        </header>

        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Adicionando o personagem e a faixa para a frase */}
        <div className="personagem-container">
          <img src={personagem1} alt="Personagem" className="personagem-img" />
          <div className="frase-faixa">
            <p className="personagem-frase">{fraseAleatoria}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
:root{
  --blue: #4facfe;
  --green: #00f2fe;
  --amber: #E9B463;
  --red: #E15148;
  --ink: #0f172a;
  --muted: rgba(255,255,255,0.85);
}

.carregamento-page{
  min-height: 100vh;
  width: 100vw;
  background: #4facfe; 
  display:flex;
  justify-content:center;
  padding: 42px 18px 60px;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  font-family: "Fredoka", "Quicksand", "Nunito", system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}

.wrap{
  width: 100%;
  max-width: 860px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap: 22px;
}

.headline{
  text-align:center;
  color: white;
}

.headline h1{
  margin:20px 0 0;
  font-family: "Baloo 2", system-ui, -apple-system, "Segoe UI", Arial, sans-serif !important;
  font-size: clamp(44px, 6vw, 86px);
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 0.95;
/* >>> sombras estilo “cartoon” (igual as que estávamos usando) */
  color: rgba(255,255,255,0.95);
  text-shadow: 0 4px 0 rgba(0,0,0,0.18), 0 14px 22px rgba(0,0,0,0.18);
}

.headline p{
  margin: 10px 0 0;
  font-size: clamp(19px, 2.5vw, 22px);
  font-weight: 300;
  opacity: 0.95;
}

/* Barra de progresso (com borda estilo cartoon) */
.progress-container {
  width: 100%;
  height: 50px;

  background: rgba(255,255,255,0.92);
  border-radius: 18px;

  border: 5px solid rgba(255,255,255,0.18);
  box-shadow: 0 10px 0 rgba(0,0,0,0.12), 0 18px 26px rgba(0,0,0,0.14);

  margin-top: 40px;
  overflow: hidden; /* importante pra barra ficar “dentro” arredondada */
}

.progress-bar {
  height: 100%;
  background-color: #E15148;

  border-radius: 12px; /* menor que a de fora */
  box-shadow: inset 0 6px 0 rgba(255,255,255,0.20);

  transition: width 0.1s ease;
}

/* Estilo para o personagem */
.personagem-container {
  margin-top: 30px;
  text-align: center;
}

.personagem-img {
  width: 400px;
  height: auto;
}

/* Faixa de frase */
.frase-faixa {
  background-color: #E15148;
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border-radius: 12px;
  text-align: center;
  position: relative;
  color: white;
  font-weight: 600;
}

.personagem-frase {
  font-size: 22px;
  margin: 0;
}
`;

export default Carregamento;