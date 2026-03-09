import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import confetti from "canvas-confetti";

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

        const res = await fetch(
          "http://127.0.0.1:8000/api/game/obter-perfil/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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
        origin: { x: 0 }
      });

      confetti({
        particleCount: 6,
        angle: 120,
        spread: 80,
        origin: { x: 1 }
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
        <h2 style={{ color: "#1f2937" }}>Carregando pergunta...</h2>
      </div>
    );
  }

  // Tela final
  if (finalizado) {
    return (
      <div className="page-container">
        <style>{styles}</style>

        <div className="card">
          <h2 className="titulo">MISSÃO COMPLETA 🏆</h2>

          <div className="xp-final">{pontosTotais} XP</div>

          <div className="resultado">{resultadoFinal}</div>

          <p className="mensagem">
            Volte no mês que vem para brincar novamente! 🦷
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <style>{styles}</style>

      <div className="card">

        <h2 className="titulo">Questionário</h2>

        <div className="xp">XP: {pontosTotais}</div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(progresso % 5) * 20}%` }}
          />
        </div>

        <h3 className="pergunta">{pergunta?.texto}</h3>

        <div className="alternativas">
          {pergunta?.alternativas.map((alt) => (
            <button
              key={alt.id}
              onClick={() => setSelecionada(alt.id)}
              className={`alt-btn ${
                selecionada === alt.id ? "selected" : ""
              }`}
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
  );
}

const styles = `

.page-container {
  min-height:100vh;
  background:linear-gradient(180deg,#FDE68A,#FCD34D,#E9B463);
  display:flex;
  justify-content:center;
  align-items:center;
  font-family:'Nunito',sans-serif;
}

.card{
  width:90%;
  max-width:850px;
  background:#E9B463;
  border-radius:22px;
  padding:40px;
  border:8px solid rgba(255,255,255,0.55);
  box-shadow:0 12px 18px rgba(0,0,0,0.15);
}

.titulo{
  font-size:3rem;
  font-weight:900;
  text-align:center;
  color:#ffffff;
  text-shadow:0 4px 0 rgba(0,0,0,0.18);
}

.xp{
  text-align:center;
  margin-top:10px;
  font-size:1.2rem;
  font-weight:800;
  color:#ffffff;
}

.pergunta{
  font-size:1.6rem;
  margin-top:30px;
  font-weight:800;
  text-align:center;
  color:#1f2937;
}

.alternativas{
  margin-top:25px;
  display:flex;
  flex-direction:column;
  gap:15px;
}

.alt-btn{
  padding:16px;
  border-radius:16px;
  border:4px solid rgba(255,255,255,0.6);
  font-weight:700;
  font-size:1rem;
  cursor:pointer;
  background:white;
  color:#1f2937;
  transition:0.2s;
}

.alt-btn:hover{
  transform:scale(1.03);
  background:#f8fafc;
}

.alt-btn.selected{
  background:#00f2fe;
  color:#0f172a;
  border-color:#ffffff;
}

.confirmar-btn{
  margin-top:30px;
  padding:16px;
  font-weight:800;
  border-radius:16px;
  border:none;
  background:#E15148;
  color:white;
  font-size:1.1rem;
  cursor:pointer;
}

.confirmar-btn:disabled{
  background:#fca5a5;
  cursor:not-allowed;
}

.progress-bar{
  width:100%;
  height:10px;
  background:rgba(255,255,255,0.4);
  border-radius:20px;
  margin-top:20px;
}

.progress-fill{
  height:100%;
  background:#00f2fe;
  border-radius:20px;
  transition:width .4s ease;
}

.xp-pop{
  text-align:center;
  margin-top:15px;
  font-size:1.4rem;
  font-weight:800;
  color:#ffffff;
}

.xp-final{
  font-size:3rem;
  font-weight:900;
  text-align:center;
  color:#ffffff;
  margin-top:30px;
}

.resultado{
  text-align:center;
  margin-top:20px;
  font-size:1.4rem;
  font-weight:800;
  color:#1f2937;
}

.mensagem{
  text-align:center;
  margin-top:15px;
  color:#374151;
}

`;