import { useState, useEffect, useContext, useRef } from "react";
import { finalizarPartida } from "../api/game";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import useMouthDetection from "../hooks/useMouthDetection";

import germ1 from "../assets/germs/germ_transparente_1.png";
import germ2 from "../assets/germs/germ_transparente_2.png";
const germImages = [germ1, germ2];

// Componente visual para Barra de Progresso (Estilo Perfil.jsx)
const StatBar = ({ label, value, max, color, showMax = false }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.85rem", color: "#6B7280", fontWeight: "600" }}>
        <span>{label}</span>
        <span>{value}{showMax ? ` / ${max}` : ""}</span>
      </div>
      <div style={{ width: "100%", height: "8px", backgroundColor: "#F3F4F6", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: color, borderRadius: "10px", transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)" }} />
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

  // Detecção Facial
  const videoRef = useRef(null);
  const { mouthOpen, mouthBox, detect } = useMouthDetection();
  
  // Ref para acessar o estado da boca dentro do setInterval sem reiniciar o timer
  const mouthRef = useRef({ open: false, faceBox: null });

  useEffect(() => {
    let currentFaceBox = null;
    if (mouthBox) {
      // Expande a área da boca para tentar pegar a face inteira
      // Valores aumentados para cobrir bochechas, nariz e queixo
      currentFaceBox = {
        left: (mouthBox.left || mouthBox.x) - 100,
        top: (mouthBox.top || mouthBox.y) - 150,
        right: (mouthBox.right || (mouthBox.left + mouthBox.width)) + 100,
        bottom: (mouthBox.bottom || (mouthBox.top + mouthBox.height)) + 100,
      };
    }

    mouthRef.current = { open: mouthOpen, faceBox: currentFaceBox };

    // Limpeza agressiva: se fechar a boca, os germes somem imediatamente
    if (!mouthOpen) setGermes([]);
  }, [mouthOpen, mouthBox]);

  // Configurações de Dificuldade
  const CONFIG = {
    facil: { maxGermes: 1, spawnRate: 1500, tempoVida: 700, pontos: 1, color: "#10B981" }, // Verde
    intermediario: { maxGermes: 3, spawnRate: 1000, tempoVida: 500, pontos: 2, color: "#F59E0B" }, // Laranja
    dificil: { maxGermes: 5, spawnRate: 600, tempoVida: 300, pontos: 3, color: "#EF4444" } // Vermelho
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
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          if (response.status === 401) {
            navigate("/"); // Redireciona para login se o token for inválido
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

  // 2. Inicializar Câmera
  useEffect(() => {
    if (!jogoIniciado) return; // Só inicia a câmera se o jogo tiver começado

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
      // Acessamos o valor atual da ref para não depender do estado e reiniciar o intervalo
      const { open, faceBox } = mouthRef.current;
      
      if (!open || !faceBox) return;

      setGermes((prev) => {
        if (prev.length >= configAtual.maxGermes) return prev;

        // Tratamento robusto para coordenadas (suporta left/top ou x/y)
        const mLeft = faceBox.left || 0;
        const mTop = faceBox.top || 0;
        const mRight = faceBox.right || 0;
        const mBottom = faceBox.bottom || 0;
        
        const width = mRight - mLeft;
        const height = mBottom - mTop;
        const margin = 10;
        
        // Garante que o germe apareça dentro da área da boca
        const randomX = mLeft + (margin / 2) + Math.random() * Math.max(0, width - margin);
        const randomY = mTop + (margin / 2) + Math.random() * Math.max(0, height - margin);

        const novoGerme = {
          id: Date.now() + Math.random(),
          x: randomX,
          y: randomY,
          createdAt: Date.now(),
          imgIndex: Math.floor(Math.random() * germImages.length)
        };

        return [...prev, novoGerme];
      });
    }, configAtual.spawnRate);

    // Limpeza de germes velhos
    const cleanup = setInterval(() => {
      const now = Date.now();
      setGermes(prev => prev.filter(g => now - g.createdAt < configAtual.tempoVida));
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cleanup);
    };
  }, [jogoIniciado, dificuldade]); // Removido faceBox das dependências para não resetar o timer

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
          proximoBadge: response?.data?.proximo_badge || null
        });
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
    setGermes(prev => prev.filter(g => g.id !== id));
    setPontos(prev => prev + CONFIG[dificuldade].pontos);
    // Opcional: Adicionar som de "pop" aqui
  };

  // Renderização
  if (!criancaId) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F3F4F6', fontFamily: "'Nunito', sans-serif", fontWeight: 'bold', color: '#8B5CF6' }}>Carregando jogo...</div>;

  const headerStyle = {
    background: "linear-gradient(135deg, #4facfe, #00f2fe)", 
    padding: "30px 25px 50px 25px",
    color: "white",
    textAlign: "center",
    position: "relative"
  };

  const contentStyle = {
    backgroundColor: "#fff", 
    marginTop: "-25px", 
    borderRadius: "30px 30px 0 0", 
    padding: "25px", 
    position: "relative",
    flex: 1 // Garante que o conteúdo preencha o resto da tela no mobile
  };

  // Estilos CSS (Compartilhados para ambas as telas)
  const styles = `
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
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .page-container {
      min-height: 100vh;
      background-color: #F3F4F6;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Nunito', sans-serif;
      box-sizing: border-box;
      padding: 0; /* Mobile: Sem padding para ocupar tudo */
      overflow-x: hidden;
    }

    /* Estilos Responsivos */
    .game-card {
      width: 100%;
      min-height: 100vh; /* Mobile: Altura total */
      background-color: #fff;
      border-radius: 0; /* Mobile: Sem bordas */
      box-shadow: none;
      overflow: hidden;
      position: relative;
      animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      display: flex;
      flex-direction: column;
    }
    .video-container {
      position: relative;
      width: 100%;
      max-width: 100%; /* Mobile: Aproveita toda a largura */
      border-radius: 25px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      overflow: hidden;
      background-color: #000;
      border: 5px solid white;
      margin: 20px;
    }

    @media (min-width: 768px) {
      .page-container { padding: 20px; }
      
      .game-card {
        min-height: auto;
        max-width: 900px; /* PC: Aumentado para igualar Perfil/Ranking */
        width: 90%;
        border-radius: 35px;
        box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
      }
      .video-container {
        max-width: 700px; /* PC: Reduzido para não estourar a tela */
        width: 90%;
        margin: 0;
      }
    }
  `;

  // Tela de Fim de Jogo
  if (finalizado) return (
    <div className="page-container">
      <style>{styles}</style>
      <div className="game-card">
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: "0", fontSize: "1.8rem", fontWeight: "800", letterSpacing: "0.5px" }}>Fim de Jogo!</h2>
          <div style={{ fontSize: "3rem", fontWeight: "800", margin: "10px 0", textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            {pontos} <span style={{ fontSize: "1rem", opacity: 0.8 }}>PTS</span>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={contentStyle}>
          {/* Badges */}
          {badges.length > 0 && (
            <div style={{ backgroundColor: "#FFFBEB", padding: "15px", borderRadius: "20px", marginBottom: "20px", border: "2px solid #FCD34D", animation: "popIn 0.5s ease" }}>
              <h3 style={{ margin: "0 0 5px 0", color: "#D97706", fontSize: "1rem", fontWeight: "800" }}>PARABÉNS! 🌟</h3>
              <p style={{ margin: "0 0 10px 0", color: "#B45309", fontSize: "0.85rem" }}>Você conquistou:</p>
              {badges.map((badge, index) => (
                <div key={index} style={{ fontWeight: "800", color: "#B45309", fontSize: "1.1rem", textTransform: "uppercase" }}>🏅 {badge}</div>
              ))}
            </div>
          )}

          {/* Barra de Progresso */}
          {progresso && progresso.proximoBadge ? (
            <StatBar 
              label={`Próxima: ${progresso.proximoBadge.nome}`} 
              value={progresso.pontosTotais} 
              max={progresso.proximoBadge.pontos} 
              color="#10B981" 
              showMax={true}
            />
          ) : progresso ? (
            <div style={{ textAlign: "center", color: "#F59E0B", fontWeight: "bold", padding: "10px" }}>🏆 Nível Máximo!</div>
          ) : null}

          <button 
            onClick={() => setFinalizado(false)}
            style={{ width: "100%", marginTop: "20px", padding: "15px", background: "linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%)", color: "white", border: "none", borderRadius: "15px", fontWeight: "800", fontSize: "1rem", boxShadow: "0 5px 15px rgba(139, 92, 246, 0.3)", cursor: "pointer" }}
          >
            JOGAR NOVAMENTE
          </button>
        </div>
      </div>
    </div>
  );

  // Tela Principal do Jogo
  return (
    <div className="page-container">
      {/* Estilos Globais de Animação */}
      <style>{styles}</style>
      
      {!jogoIniciado ? (
        <div className="game-card">
          <div style={headerStyle}>
             <h1 style={{ margin: "0", fontSize: "2rem", fontWeight: "800", letterSpacing: "0.5px" }}>Caça aos Germes</h1>
             <p style={{ margin: "5px 0 0", fontSize: "0.9rem", opacity: 0.9, fontWeight: "600" }}>Prepare sua escova!</p>
          </div>
          <div style={contentStyle}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem", color: "#1F2937", fontWeight: "800" }}>Escolha a Dificuldade</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["facil", "intermediario", "dificil"].map((nivel) => (
                <button
                  key={nivel}
                  onClick={() => setDificuldade(nivel)}
                  style={{
                    padding: "15px",
                    borderRadius: "15px",
                    border: "2px solid",
                    borderColor: dificuldade === nivel ? CONFIG[nivel].color : "#F3F4F6",
                    backgroundColor: dificuldade === nivel ? `${CONFIG[nivel].color}20` : "#fff",
                    color: dificuldade === nivel ? CONFIG[nivel].color : "#9CA3AF",
                    fontWeight: "800",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s"
                  }}
                >
                  <span>{nivel}</span>
                  {dificuldade === nivel && <span>✔</span>}
                </button>
              ))}
            </div>

            <button 
              onClick={iniciarPartida}
              style={{
                width: "100%",
                marginTop: "25px",
                padding: "15px",
                background: "linear-gradient(90deg, #10B981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: "15px",
                fontSize: "1.1rem",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 5px 15px rgba(16, 185, 129, 0.4)",
                animation: "pulse 2s infinite"
              }}
            >
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
            <div style={{ position: "absolute", top: "15px", left: "15px", right: "15px", display: "flex", justifyContent: "space-between", pointerEvents: "none" }}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.9)", padding: "8px 15px", borderRadius: "12px", fontWeight: "800", color: "#EF4444", fontSize: "1.2rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                ⏰ {tempo}s
              </div>
              
              <button 
                onClick={desistirJogo}
                style={{ pointerEvents: "auto", backgroundColor: "#EF4444", color: "white", border: "2px solid white", padding: "5px 15px", borderRadius: "20px", fontWeight: "bold", fontSize: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.2)", cursor: "pointer" }}
              >
                🏳️ Desistir
              </button>

              <div style={{ backgroundColor: "rgba(255,255,255,0.9)", padding: "8px 15px", borderRadius: "12px", fontWeight: "800", color: "#10B981", fontSize: "1.2rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                🏆 {pontos}
              </div>
            </div>

            {/* Overlay de Germes */}
            {jogoIniciado && (
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                {!mouthOpen && (
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "rgba(0,0,0,0.7)", color: "white", padding: "15px 25px", borderRadius: "20px", fontWeight: "bold", fontSize: "1.5rem", textAlign: "center" }}>
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
                        position: "absolute", left: visualX - 25, top: visualY - 25, width: "50px", height: "auto",
                        cursor: "pointer", pointerEvents: "auto", animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", zIndex: 20
                      }}
                      draggable={false}
                    />
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ marginTop: "20px", color: "#6B7280", fontWeight: "600", textAlign: "center", maxWidth: "500px" }}>
            <p>Dica: Abra bem a boca para encontrar os germes escondidos! Clique neles rápido antes que sumam!</p>
          </div>
        </>
      )}
    </div>
  );
}