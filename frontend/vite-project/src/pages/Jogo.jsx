import { useState, useEffect, useContext, useRef } from "react";
import { finalizarPartida } from "../api/game";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import useMouthDetection from "../hooks/useMouthDetection";

import dentista from "../assets/dentista_transparente.png";
import fada from "../assets/fada_transparente.png";
import monstro from "../assets/monstro_transparente.png";
import principe from "../assets/principe_transparente.png";
import rei from "../assets/rei_transparente.png";
import germ1 from "../assets/germs/germ_transparente_1.png";
import germ2 from "../assets/germs/germ_transparente_2.png";
import germ3 from "../assets/germs/germ_transparente_3.png";
import germ4 from "../assets/germs/germ_transparente_4.png";
const germImages = [germ1, germ2, germ3, germ4];

// Componente visual para Barra de Progresso (Estilo Perfil.jsx)
const StatBar = ({ label, value, max, color, showMax = false }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
          fontSize: "0.85rem",
          color: "#6B7280",
          fontWeight: "600",
        }}
      >
        <span>{label}</span>
        <span>
          {value}
          {showMax ? ` / ${max}` : ""}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#F3F4F6",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "10px",
            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
};

export default function Jogo() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [criancaId, setCriancaId] = useState(null);

  // Estados do Jogo
  const [dificuldade, setDificuldade] = useState("facil");
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [tempo, setTempo] = useState(30);
  const [pontos, setPontos] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [badges, setBadges] = useState([]);
  const [germes, setGermes] = useState([]);
  const [progresso, setProgresso] = useState(null); // Estado para guardar dados do próximo nível
  const [personagemLiberado, setPersonagemLiberado] = useState(false);
  const [personagemAtivo, setPersonagemAtivo] = useState(null);
  const [monstroTremendo, setMonstroTremendo] = useState(true);

  //todos os personagens dentro do jogo
  const imagensPersonagens = {
    "dentista_transparente.png": dentista,
    "fada_transparente.png": fada,
    "monstro_transparente.png": monstro,
    "principe_transparente.png": principe,
    "rei_transparente.png": rei,
  };

  // Detecção Facial
  const videoRef = useRef(null);
  const { mouthOpen, mouthBox, detect } = useMouthDetection();

  // Ref para acessar o estado da boca dentro do setInterval sem reiniciar o timer
  const mouthRef = useRef({ open: false, faceBox: null });

  useEffect(() => {
    let currentFaceBox = null;
    if (mouthBox) {
      currentFaceBox = {
        left: (mouthBox.left || mouthBox.x) - 100,
        top: (mouthBox.top || mouthBox.y) - 150,
        right: (mouthBox.right || (mouthBox.left + mouthBox.width)) + 100,
        bottom: (mouthBox.bottom || (mouthBox.top + mouthBox.height)) + 100,
      };
    }

    mouthRef.current = { open: mouthOpen, faceBox: currentFaceBox };

    if (!mouthOpen) setGermes([]);
  }, [mouthOpen, mouthBox]);

  // Configurações de Dificuldade
  const CONFIG = {
    facil: { maxGermes: 1, spawnRate: 1500, tempoVida: 700, pontos: 1, color: "#8BA26E" },
    intermediario: { maxGermes: 3, spawnRate: 1000, tempoVida: 500, pontos: 2, color: "#E9B463" },
    dificil: { maxGermes: 5, spawnRate: 600, tempoVida: 300, pontos: 3, color: "#E15148" },
  };

  // 1. Carregar ID da Criança
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    async function fetchCriancaId() {
      if (user) {
        const token = localStorage.getItem("access");
        try {
          const response = await fetch("http://127.0.0.1:8000/api/game/obter-perfil/", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 401) {
            navigate("/");
            return;
          }

          if (response.ok) {
            const data = await response.json();
            setCriancaId(data.id);
          }
        } catch (error) {
          console.error("Erro ID:", error);
        }
      }
    }
    fetchCriancaId();
  }, [user, navigate]);

  //Monstro tremendo
  useEffect(() => {
    if (!jogoIniciado) {
      setMonstroTremendo(true);

      const timer = setTimeout(() => {
        setMonstroTremendo(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [jogoIniciado]);

  //bucando o ativo
  useEffect(() => {
    if (!criancaId) return;

    async function buscarAtivo() {
      const token = localStorage.getItem("access");

      const response = await fetch(`http://127.0.0.1:8000/api/game/personagens/${criancaId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      const ativo = data.find((p) => p.ativo);
      if (ativo) setPersonagemAtivo(ativo);
    }

    buscarAtivo();
  }, [criancaId]);

  // 2. Inicializar Câmera
  useEffect(() => {
    if (!jogoIniciado) return;

    async function startCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (err) {
          console.error("Erro ao iniciar câmera:", err);
        }
      }
    }
    startCamera();
  }, [jogoIniciado]);

  // 3. Loop de Detecção (RequestAnimationFrame)
  useEffect(() => {
    let animationId;
    const loop = () => {
      if (videoRef.current) {
        detect(videoRef.current);
      }
      animationId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationId);
  }, [detect]);

  // 4. Timer do Jogo
  useEffect(() => {
    if (!jogoIniciado) return;
    if (tempo <= 0) {
      encerrarJogo();
      return;
    }
    const timer = setTimeout(() => {
      setTempo((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [tempo, jogoIniciado]);

  // 5. Lógica de Spawning de Germes
  useEffect(() => {
    if (!jogoIniciado) return;

    const configAtual = CONFIG[dificuldade];

    const interval = setInterval(() => {
      const { open, faceBox } = mouthRef.current;

      if (!open || !faceBox) return;

      setGermes((prev) => {
        if (prev.length >= configAtual.maxGermes) return prev;

        const mLeft = faceBox.left || 0;
        const mTop = faceBox.top || 0;
        const mRight = faceBox.right || 0;
        const mBottom = faceBox.bottom || 0;

        const width = mRight - mLeft;
        const height = mBottom - mTop;
        const margin = 10;

        const randomX = mLeft + margin / 2 + Math.random() * Math.max(0, width - margin);
        const randomY = mTop + margin / 2 + Math.random() * Math.max(0, height - margin);

        const novoGerme = {
          id: Date.now() + Math.random(),
          x: randomX,
          y: randomY,
          createdAt: Date.now(),
          imgIndex: Math.floor(Math.random() * germImages.length),
        };

        return [...prev, novoGerme];
      });
    }, configAtual.spawnRate);

    const cleanup = setInterval(() => {
      const now = Date.now();
      setGermes((prev) => prev.filter((g) => now - g.createdAt < configAtual.tempoVida));
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cleanup);
    };
  }, [jogoIniciado, dificuldade]);

  // Funções de Controle
  function iniciarPartida() {
    setJogoIniciado(true);
    setFinalizado(false);
    setTempo(30);
    setPontos(0);
    setGermes([]);
  }

  async function encerrarJogo() {
    setJogoIniciado(false);
    setFinalizado(true);
    setGermes([]);

    if (criancaId) {
      try {
        const response = await finalizarPartida(criancaId, pontos, dificuldade);

        setBadges(response?.data?.badges_novos || []);

        setProgresso({
          pontosTotais: response?.data?.pontos_totais || 0,
          proximoBadge: response?.data?.proximo_badge || null,
        });

        if (response?.data?.personagens_disponiveis?.length > 0) {
          setPersonagemLiberado(true);
          localStorage.setItem("notificacao_personagem", "true");
          window.dispatchEvent(new Event("notificacaoAtualizada"));
        }
      } catch (error) {
        console.error("Erro ao salvar partida", error);
      }
    }
  }

  function desistirJogo() {
    setJogoIniciado(false);
    setFinalizado(false);
    setTempo(30);
    setPontos(0);
    setGermes([]);
  }

  const matarGerme = (id) => {
    setGermes((prev) => prev.filter((g) => g.id !== id));
    setPontos((prev) => prev + CONFIG[dificuldade].pontos);
  };

  if (!criancaId)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#E15148",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: "bold",
          color: "rgba(255,255,255,0.95)",
          textShadow: "0 4px 0 rgba(0,0,0,0.14), 0 12px 22px rgba(0,0,0,0.14)",
        }}
      >
        Carregando jogo...
      </div>
    );

  // ====== LAYOUT (só estilo) ======
  const headerStyle = {
    background: "transparent",
    padding: "26px 22px 12px 22px",
    color: "white",
    textAlign: "center",
  };

  const contentStyle = {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: "22px",
    padding: "22px",
    position: "relative",
  };

  // Estilos CSS
  const styles = `
    :root{
      --bg: #E15148;
      --card: #B63A33;     /* vermelho mais escuro que o bg */
      --cardEdge: rgba(255,255,255,0.55);
      --shadowA: 0 16px 0 rgba(255,255,255,0.12);
      --shadowB: 0 26px 50px rgba(0,0,0,0.18);
    }

    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(40px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes popIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .page-container {
      min-height: 100vh;
      width: 100vw;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Nunito', sans-serif;
      box-sizing: border-box;
      padding: 18px;
      overflow-x: hidden;

      margin-left: calc(50% - 50vw);
      margin-right: calc(50% - 50vw);
    }

    /* ===== BALÃO DE FALA ===== */
    .speech-bubble {
      position: fixed;
      max-width: 240px;
      background: rgba(255,255,255,0.95);
      padding: 12px 16px;
      border-radius: 18px;
      font-weight: 800;
      font-size: 1.95rem;
      box-shadow: 0 8px 20px rgba(0,0,0,0.18);
      z-index: 6;
      animation: popIn 0.4s ease;
    }

    /* ===== CARD PRINCIPAL ===== */
    .game-card {
      width: 100%;
      max-width: 860px;
      border-radius: 34px;
      overflow: hidden;
      position: relative;
      animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      display: flex;
      flex-direction: column;

      background: var(--card);
      border: 6px solid var(--cardEdge);
      box-shadow: var(--shadowA), var(--shadowB);
    }

    /* header do card */
    .game-header{
      padding: 26px 22px 16px;
      color: rgba(255,255,255,0.96);
      text-align: center;
    }

    .game-title{
      margin: 0;
      font-weight: 900;
      letter-spacing: 0.5px;
      font-size: clamp(34px, 5vw, 86px);
      line-height: 1;

      text-shadow:
        2px 2px 0 rgba(0,0,0,0.20),
        0 6px 0 rgba(0,0,0,0.18);
    }

    .game-sub{
      margin: 10px 0 0;
      font-size: 1.4rem;
      font-weight: 800;
      opacity: 0.95;
    }

    /* corpo branco dentro do card */
    .game-body{
      background: rgba(255,255,255,0.96);
      border-top-left-radius: 26px;
      border-top-right-radius: 26px;
      padding: 22px;
    }

    /* ===== BOTÕES de dificuldade ===== */
    .diff-btn{
      padding: 14px;
      border-radius: 16px;
      border: 2px solid #F3F4F6;
      background: #fff;
      color: #6B7280;
      font-weight: 900;
      cursor: pointer;
      text-transform: capitalize;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: transform 120ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
    }
    .diff-btn:hover{
      transform: translateY(-1px);
      box-shadow: 0 10px 18px rgba(0,0,0,0.08);
    }

    .start-btn{
      width: 100%;
      margin-top: 18px;
      padding: 16px;
      border-radius: 18px;
      border: none;
      background: #9E2F2A;
      color: white;
      font-size: 1.15rem;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 12px 0 rgba(0,0,0,0.10), 0 18px 24px rgba(0,0,0,0.18);
      animation: pulse 2s infinite;
      transition: transform 120ms ease, box-shadow 120ms ease, background 160ms ease;
    }
    .start-btn:hover{ background: #ff5148; }
    .start-btn:active{
      transform: translateY(2px);
      box-shadow: 0 10px 0 rgba(0,0,0,0.10), 0 16px 22px rgba(0,0,0,0.18);
    }

    /* ===== VIDEO ===== */
    .video-container {
      position: relative;
      width: min(760px, 92vw);
      border-radius: 26px;
      box-shadow: var(--shadowA), var(--shadowB);
      overflow: hidden;
      background-color: #000;
      border: 6px solid rgba(255,255,255,0.55);
      margin-top: 12px;
    }

    @media (max-width: 768px){
      .page-container{ padding: 14px; }
      .game-card{ max-width: 94vw; }
      .game-body{ padding: 18px; }
      .video-container{ width: 94vw; }
    }
  `;

  // Tela de Fim de Jogo (mantive, mas sem mexer na lógica — só deixei o bg coerente)
  if (finalizado)
    return (
      <div className="page-container">
        <style>{styles}</style>

        {personagemLiberado && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "35px",
                borderRadius: "25px",
                textAlign: "center",
                maxWidth: "350px",
                width: "90%",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                animation: "popIn 0.4s ease",
                position: "relative",
              }}
            >
              <button
                onClick={() => setPersonagemLiberado(false)}
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "#F3F4F6",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                ✕
              </button>

              <h2 style={{ marginBottom: "15px", color: "#8B5CF6" }}>🎉 Novo Herói Liberado!</h2>

              <p style={{ marginBottom: "25px", fontWeight: "600", color: "#374151" }}>
                Você conquistou um novo personagem!
                <br />
                Clique abaixo para desbloquear.
              </p>

              <button
                onClick={() => navigate("/personagens")}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "15px",
                  border: "none",
                  background: "linear-gradient(90deg, #8B5CF6, #6366F1)",
                  color: "white",
                  fontWeight: "800",
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 10px 20px rgba(139, 92, 246, 0.3)",
                }}
              >
                🔓 Ir desbloquear agora!
              </button>
            </div>
          </div>
        )}

        <div className="game-card">
          <div className="game-header">
            <h2 className="game-title" style={{ fontSize: "clamp(34px, 4vw, 48px)" }}>
              Fim de Jogo!
            </h2>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "900",
                margin: "10px 0 0",
                textShadow: "2px 2px 0 rgba(0,0,0,0.18), 0 6px 0 rgba(0,0,0,0.18)",
              }}
            >
              {pontos} <span style={{ fontSize: "1rem", opacity: 0.9 }}>PTS</span>
            </div>
          </div>

          <div className="game-body">
            {badges.length > 0 && (
              <div
                style={{
                  backgroundColor: "#FFFBEB",
                  padding: "15px",
                  borderRadius: "20px",
                  marginBottom: "20px",
                  border: "2px solid #FCD34D",
                  animation: "popIn 0.5s ease",
                }}
              >
                <h3 style={{ margin: "0 0 5px 0", color: "#D97706", fontSize: "1rem", fontWeight: "900" }}>
                  PARABÉNS! 🌟
                </h3>
                <p style={{ margin: "0 0 10px 0", color: "#B45309", fontSize: "0.85rem", fontWeight: 800 }}>
                  Você conquistou:
                </p>
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    style={{
                      fontWeight: "900",
                      color: "#B45309",
                      fontSize: "1.1rem",
                      textTransform: "uppercase",
                    }}
                  >
                    🏅 {badge}
                  </div>
                ))}
              </div>
            )}

            {progresso && progresso.proximoBadge ? (
              <StatBar
                label={`Próxima: ${progresso.proximoBadge.nome}`}
                value={progresso.pontosTotais}
                max={progresso.proximoBadge.pontos}
                color="#10B981"
                showMax={true}
              />
            ) : progresso ? (
              <div style={{ textAlign: "center", color: "#F59E0B", fontWeight: 900, padding: "10px" }}>
                🏆 Nível Máximo!
              </div>
            ) : null}

            <button
              onClick={() => setFinalizado(false)}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "15px",
                background: "#E15148",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontWeight: "900",
                fontSize: "1rem",
                boxShadow: "0 10px 0 rgba(0,0,0,0.10), 0 18px 24px rgba(0,0,0,0.18)",
                cursor: "pointer",
              }}
            >
              JOGAR NOVAMENTE
            </button>

            <button
              onClick={() => navigate("/personagens")}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "14px",
                background: "#158d94",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontWeight: "900",
                fontSize: "1.05rem",
                boxShadow: "0 10px 0 rgba(0,0,0,0.10), 0 18px 24px rgba(0,0,0,0.18)",
                cursor: "pointer",
              }}
            >
              🔓 Ver próximos heróis desbloqueados
            </button>
          </div>
        </div>
      </div>
    );

  // Tela Principal do Jogo
  return (
    <div className="page-container">
      <style>{styles}</style>

      {/* 👾 MONSTRO */}
      {!jogoIniciado && (
        <>
          <img
            src={monstro}
            alt="Monstro"
            style={{
              position: "fixed",
              bottom: "90px",
              left: "70px",
              width: "250px",
              zIndex: 5,
            }}
          />

          <div className="speech-bubble" style={{ bottom: "300px", left: "70px" }}>
            Duvido você conseguir nos destruir! 😈
            <div
              style={{
                position: "absolute",
                bottom: "-12px",
                left: "30px",
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "12px solid rgba(255,255,255,0.95)",
              }}
            />
          </div>
        </>
      )}
      {/* MONSTRO 2*/}
      {!jogoIniciado && (
        <>
          <img
            src={germ1}
            alt="Monstro"
            style={{
              position: "fixed",
              bottom: "590px",
              left: "1600px",
              width: "250px",
              zIndex: 5,
            }}
          />

          <div className="speech-bubble" style={{ bottom: "820px", left: "1600px" }}>
            Vamos ver se você é bom mesmo! 💥 
            <div
              style={{
                position: "absolute",
                bottom: "-12px",
                left: "30px",
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "12px solid rgba(255,255,255,0.95)",
              }}
            />
          </div>
        </>
      )}

      {/* 👑 PERSONAGEM ATIVO */}
      {!jogoIniciado && personagemAtivo && (
        <>
          <img
            src={imagensPersonagens[personagemAtivo.asset_nome]}
            alt="Personagem ativo"
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              width: "120px",
              zIndex: 5,
            }}
          />

          <div className="speech-bubble" style={{ bottom: "150px", right: "20px", background: "#E0F2FE" }}>
            💪 Vamos sim! Vamos matar todos os bichinhos!
            <br />
            Consegue me ajudar, {user?.first_name || user?.username}?
            <div
              style={{
                position: "absolute",
                bottom: "-12px",
                right: "30px",
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "12px solid #E0F2FE",
              }}
            />
          </div>
        </>
      )}

      {!jogoIniciado ? (
        <div className="game-card">
          <div className="game-header" style={headerStyle}>
            <h1 className="game-title">Caça aos Germes</h1>
            <p className="game-sub">Prepare sua escova!</p>
          </div>

          <div className="game-body" style={contentStyle}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "1.4rem", color: "#111827", fontWeight: 900 }}>
              Escolha a Dificuldade
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["facil", "intermediario", "dificil"].map((nivel) => (
                <button
                  key={nivel}
                  onClick={() => setDificuldade(nivel)}
                  className="diff-btn"
                  style={{
                    borderColor: dificuldade === nivel ? CONFIG[nivel].color : "#E5E7EB",
                    background: dificuldade === nivel ? `${CONFIG[nivel].color}22` : "#fff",
                    color: dificuldade === nivel ? CONFIG[nivel].color : "#6B7280",
                  }}
                >
                  <span>{nivel}</span>
                  {dificuldade === nivel && <span>✔</span>}
                </button>
              ))}
            </div>

            <button onClick={iniciarPartida} className="start-btn">
              COMEÇAR JOGO
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="video-container">
            <video
              ref={videoRef}
              style={{ width: "100%", height: "auto", display: "block", transform: "scaleX(-1)" }}
              muted
              playsInline
            />

            {/* HUD */}
            <div
              style={{
                position: "absolute",
                top: "15px",
                left: "15px",
                right: "15px",
                display: "flex",
                justifyContent: "space-between",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.92)",
                  padding: "8px 15px",
                  borderRadius: "12px",
                  fontWeight: "900",
                  color: "#EF4444",
                  fontSize: "1.2rem",
                  boxShadow: "0 10px 18px rgba(0,0,0,0.18)",
                }}
              >
                ⏰ {tempo}s
              </div>

              <button
                onClick={desistirJogo}
                style={{
                  pointerEvents: "auto",
                  backgroundColor: "#EF4444",
                  color: "white",
                  border: "2px solid white",
                  padding: "7px 16px",
                  borderRadius: "999px",
                  fontWeight: "900",
                  fontSize: "1rem",
                  boxShadow: "0 10px 18px rgba(0,0,0,0.22)",
                  cursor: "pointer",
                }}
              >
                🏳️ Desistir
              </button>

              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.92)",
                  padding: "8px 15px",
                  borderRadius: "12px",
                  fontWeight: "900",
                  color: "#10B981",
                  fontSize: "1.2rem",
                  boxShadow: "0 10px 18px rgba(0,0,0,0.18)",
                }}
              >
                🏆 {pontos}
              </div>
            </div>

            {/* Overlay de Germes */}
            {jogoIniciado && (
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                {!mouthOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "rgba(0,0,0,0.72)",
                      color: "white",
                      padding: "15px 25px",
                      borderRadius: "20px",
                      fontWeight: 900,
                      fontSize: "1.5rem",
                      textAlign: "center",
                      boxShadow: "0 14px 28px rgba(0,0,0,0.28)",
                    }}
                  >
                    😮 ABRA A BOCA!
                  </div>
                )}

                {germes.map((germe) => {
                  const videoEl = videoRef.current;
                  if (!videoEl || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) return null;

                  const scaleX = videoEl ? videoEl.clientWidth / videoEl.videoWidth : 1;
                  const scaleY = videoEl ? videoEl.clientHeight / videoEl.videoHeight : 1;
                  const visualX = (videoEl.videoWidth - germe.x) * scaleX;
                  const visualY = germe.y * scaleY;

                  return (
                    <img
                      key={germe.id}
                      src={germImages[germe.imgIndex]}
                      onMouseDown={() => matarGerme(germe.id)}
                      style={{
                        position: "absolute",
                        left: visualX - 25,
                        top: visualY - 25,
                        width: "50px",
                        height: "auto",
                        cursor: "pointer",
                        pointerEvents: "auto",
                        animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        zIndex: 20,
                      }}
                      draggable={false}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ marginTop: "16px", color: "rgba(255,255,255,0.92)", fontWeight: 800, textAlign: "center", maxWidth: "560px", textShadow: "0 6px 16px rgba(0,0,0,0.18)" }}>
            <p style={{ margin: 0 }}>
              Dica: Abra bem a boca para encontrar os germes escondidos! Clique neles rápido antes que sumam!
            </p>
          </div>
        </>
      )}
    </div>
  );
}