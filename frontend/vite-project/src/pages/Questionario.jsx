import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import confetti from "canvas-confetti";

// ✅ IMPORTA OS PERSONAGENS (ajuste os paths se necessário)
import dentista from "../assets/dentista_transparente.png";
import rei from "../assets/rei_transparente.png";
import principe from "../assets/principe_transparente.png";
import fada from "../assets/fada_transparente.png";
import monstro from "../assets/monstro_transparente.png";

export default function Questionario() {
  const { user } = useContext(AuthContext);

  const [criancaId, setCriancaId] = useState(null);
  const [pergunta, setPergunta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selecionada, setSelecionada] = useState(null);
  const [finalizado, setFinalizado] = useState(false);
  const [xpAnim, setXpAnim] = useState(false);
  const [pontosTotais, setPontosTotais] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [resultadoFinal, setResultadoFinal] = useState("");

  // ✅ LISTA DE PERSONAGENS + ESCOLHA DO PERSONAGEM DA PERGUNTA
  const personagens = [rei, principe, dentista, fada, monstro];
  const personagemAtual = pergunta
    ? personagens[pergunta.id % personagens.length]
    : personagens[0];

  // Fonte Nunito
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // Buscar perfil da criança
  useEffect(() => {
    async function fetchPerfil() {
      try {
        const token = localStorage.getItem("access");

        const res = await fetch("http://127.0.0.1:8000/api/game/obter-perfil/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) return;

        setCriancaId(data.id);
      } catch (err) {
        console.error(err);
      }
    }

    fetchPerfil();
  }, []);

  // Buscar próxima pergunta
  useEffect(() => {
    if (!criancaId) return;

    async function fetchPergunta() {
      setLoading(true);

      try {
        const res = await api.get(`questions/proxima/${criancaId}/`);

        if (res.data.finalizado) {
          setFinalizado(true);
          setPontosTotais(res.data.score || 0);
          setResultadoFinal(res.data.resultado || "");
        } else {
          setPergunta(res.data.pergunta);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPergunta();
  }, [criancaId, progresso]);

  // 🎉 Confete quando terminar
  useEffect(() => {
    if (!finalizado) return;

    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 80,
        origin: { x: 0 },
      });

      confetti({
        particleCount: 6,
        angle: 120,
        spread: 80,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [finalizado]);

  async function enviarResposta() {
    if (selecionada === null) return;

    try {
      const res = await api.post("questions/responder/", {
        crianca_id: criancaId,
        pergunta_id: pergunta.id,
        alternativa_id: selecionada,
      });

      setPontosTotais(res.data.score_parcial);
      setXpAnim(true);

      setTimeout(() => {
        setXpAnim(false);
        setSelecionada(null);
        setProgresso((prev) => prev + 1);
      }, 900);
    } catch (err) {
      console.error(err);
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="page-container">
        <style>{styles}</style>
        <h2 style={{ color: "#1f2937", fontWeight: 900 }}>
          Carregando pergunta...
        </h2>
      </div>
    );
  }

  // Tela final
  if (finalizado) {
    return (
      <div className="page-container">
        <style>{styles}</style>

        <div className="card">
          <div className="card-header">
            <h2 className="titulo">MISSÃO COMPLETA 🏆</h2>
            <span className="subtitulo">Mandou bem demais!</span>
          </div>

          <div className="card-body">
            <div className="xp-final">{pontosTotais} XP</div>
            <div className="resultado">{resultadoFinal}</div>
            <p className="mensagem">
              Volte no mês que vem para brincar novamente! 🦷
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <style>{styles}</style>

      <div className="card">
        <div className="card-header">
          <h2 className="titulo">Questionário</h2>
          <span className="subtitulo">Hora de cuidar dos dentinhos!</span>
        </div>

        <div className="card-body">
          <div className="xp">XP: {pontosTotais}</div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progresso % 5) * 20}%` }}
            />
          </div>

          {/* ✅ PERSONAGEM DA PERGUNTA (AQUI) */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <img
              src={personagemAtual}
              alt="Personagem"
              style={{
                width: "160px",
                height: "160px",
                objectFit: "contain",
                filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.18))",
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
            />
          </div>

          <h3 className="pergunta">{pergunta?.texto}</h3>

          <div className="alternativas">
            {pergunta?.alternativas.map((alt) => (
              <button
                key={alt.id}
                onClick={() => setSelecionada(alt.id)}
                className={`alt-btn ${selecionada === alt.id ? "selected" : ""}`}
              >
                {alt.texto}
              </button>
            ))}
          </div>

          <button
            onClick={enviarResposta}
            disabled={!selecionada}
            className="confirmar-btn"
          >
            Confirmar Resposta
          </button>

          {xpAnim && <div className="xp-pop">+XP ⭐</div>}
        </div>
      </div>
    </div>
  );
}

const styles = `
:root{
  --amber: #E9B463;
  --amberDark: #B07D2A;
  --red: #E15148;
  --cyan: #00f2fe;
  --ink: #0f172a;
}

.page-container {
  min-height: 100vh;
  width: 100vw;
  background: var(--amber);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Nunito', sans-serif;
  padding: 18px;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  box-sizing: border-box;
}

.card{
  width: 90%;
  max-width: 850px;
  background: rgba(255,255,255,0.20);
  border-radius: 34px;
  padding: 0;
  overflow: hidden;
  border: 6px solid rgba(255,255,255,0.55);
  box-shadow: 0 16px 0 rgba(255,255,255,0.12), 0 26px 50px rgba(0,0,0,0.18);
  box-sizing: border-box;
  backdrop-filter: blur(6px);
}

.card-header{
  background: var(--amberDark);
  padding: 22px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.titulo{
  margin: 0;
  font-size: 2.6rem;
  font-weight: 900;
  color: #ffffff;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.14), 0 6px 0px rgba(0,0,0,0.14);
  text-align: left;
}

.subtitulo{
  font-weight: 800;
  color: rgba(255,255,255,0.95);
  font-size: 0.95rem;
  white-space: nowrap;
}

.card-body{
  background: rgba(255,255,255,0.92);
  padding: 30px 40px 40px;
  box-sizing: border-box;
}

.xp{
  text-align: center;
  margin-top: 6px;
  font-size: 1.2rem;
  font-weight: 800;
  color: rgba(15,23,42,0.75);
}

.pergunta{
  font-size: 1.6rem;
  margin-top: 18px;
  font-weight: 900;
  text-align: center;
  color: #1f2937;
}

.alternativas{
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.alt-btn{
  padding: 16px;
  border-radius: 16px;
  border: 4px solid rgba(0,0,0,0.06);
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  background: white;
  color: #1f2937;
  transition: 0.2s;
  box-shadow: 0 8px 14px rgba(0,0,0,0.06);
}

.alt-btn:hover{
  transform: translateY(-1px) scale(1.01);
  background: #f8fafc;
}

.alt-btn.selected{
  background: #4facfe;
  color: var(--ink);
  border-color: rgba(255,255,255,0.85);
}

.confirmar-btn{
  margin-top: 26px;
  padding: 16px;
  font-weight: 900;
  border-radius: 16px;
  border: none;
  background: var(--red);
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(0,0,0,0.12);
}

.confirmar-btn:disabled{
  background: #fca5a5;
  cursor: not-allowed;
  box-shadow: none;
}

.progress-bar{
  width: 100%;
  height: 10px;
  background: rgba(0,0,0,0.06);
  border-radius: 20px;
  margin-top: 16px;
  overflow: hidden;
}

.progress-fill{
  height: 100%;
  background: #4facfe;
  border-radius: 20px;
  transition: width .4s ease;
}

.xp-pop{
  text-align: center;
  margin-top: 14px;
  font-size: 1.4rem;
  font-weight: 900;
  color: rgba(15,23,42,0.75);
}

.xp-final{
  font-size: 5rem;
  font-weight: 900;
  text-align: center;
  color: rgba(15,23,42,0.85);
  margin-top: 18px;
}

.resultado{
  text-align: center;
  margin-top: 18px;
  font-size: 1.4rem;
  font-weight: 900;
  color: #1f2937;
}

.mensagem{
  text-align: center;
  margin-top: 14px;
  color: #374151;
  font-weight: 700;
}

@media (max-width: 560px){
  .subtitulo{ display:none; }
  .card-body{ padding: 26px; }
  .titulo{ font-size: 2.1rem; }
  .pergunta{ font-size: 1.25rem; }
}
`;