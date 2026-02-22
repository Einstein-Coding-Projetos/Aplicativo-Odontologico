import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";

export default function Questionario() {

  const { user } = useContext(AuthContext);

  const [criancaId, setCriancaId] = useState(null);
  const [pergunta, setPergunta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecionada, setSelecionada] = useState(null);
  const [finalizado, setFinalizado] = useState(false);
  const [xpAnim, setXpAnim] = useState(false);
  const [pontosTotais, setPontosTotais] = useState(0);
  const [progresso, setProgresso] = useState(0);

  // Fonte Nunito
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // Buscar ID da criança
  useEffect(() => {
    async function fetchPerfil() {
      const token = localStorage.getItem("access");
      const res = await fetch("http://127.0.0.1:8000/api/game/obter-perfil/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCriancaId(data.id);
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

  async function enviarResposta() {
    if (!selecionada) return;

    try {
      const res = await api.post("questions/responder/", {
        crianca_id: criancaId,
        pergunta_id: pergunta.id,
        alternativa_id: selecionada
      });

      setPontosTotais(res.data.pontos_totais);
      setXpAnim(true);

      setTimeout(() => {
        setXpAnim(false);
        setSelecionada(null);
        setProgresso(prev => prev + 1);
      }, 900);

    } catch (err) {
      console.error(err);
    }
  }

  // LOADING
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Nunito",
        fontWeight: "800",
        color: "#8B5CF6"
      }}>
        Carregando pergunta...
      </div>
    );
  }

  // TELA FINAL
  if (finalizado) {
    return (
      <div className="page-container">
        <style>{styles}</style>

        <div className="card">
          <div className="header">
            <h2>MISSÃO COMPLETA 🏆</h2>
          </div>

          <div className="content">
            <h3 style={{ textAlign: "center", marginBottom: "15px" }}>
              Você ganhou:
            </h3>

            <div style={{
              fontSize: "3rem",
              textAlign: "center",
              fontWeight: "800",
              color: "#10B981"
            }}>
              {pontosTotais} XP
            </div>

            <p style={{
              textAlign: "center",
              marginTop: "10px",
              color: "#6B7280"
            }}>
              Continue cuidando do seu sorriso! 🦷✨
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

        {/* HEADER */}
        <div className="header">
          <h2>Questionário</h2>
          <div className="xp">XP: {pontosTotais}</div>
        </div>

        {/* CONTEÚDO */}
        <div className="content">

          {/* Barra de Progresso */}
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

          {xpAnim && <div className="xp-pop">+10 XP 🎉</div>}
        </div>
      </div>
    </div>
  );
}

const styles = `
.page-container {
  min-height: 100vh;
  background-color: #F3F4F6;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Nunito', sans-serif;
}

.card {
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .card {
    max-width: 900px;
    border-radius: 35px;
    box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
  }
}

.header {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  padding: 30px;
  color: white;
  text-align: center;
}

.content {
  padding: 25px;
  flex: 1;
}

.pergunta {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.alternativas {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.alt-btn {
  padding: 15px;
  border-radius: 15px;
  border: 2px solid #E5E7EB;
  background: white;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.alt-btn:hover {
  background: #F3F4F6;
}

.alt-btn.selected {
  border-color: #8B5CF6;
  background: #F5F3FF;
  color: #6D28D9;
}

.confirmar-btn {
  margin-top: 25px;
  padding: 15px;
  background: linear-gradient(90deg, #8B5CF6, #6366F1);
  border: none;
  color: white;
  font-weight: 800;
  border-radius: 15px;
  cursor: pointer;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #E5E7EB;
  border-radius: 10px;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: #10B981;
  border-radius: 10px;
  transition: width 0.4s ease;
}

.xp-pop {
  margin-top: 15px;
  font-weight: 800;
  color: #10B981;
  animation: pop 0.6s ease;
}

@keyframes pop {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
`;