import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

import dentista from "../assets/dentista_transparente.png";
import fada from "../assets/fada_transparente.png";
import monstro from "../assets/monstro_transparente.png";
import principe from "../assets/principe_transparente.png";
import rei from "../assets/rei_transparente.png";

export default function Personagens() {
  const [personagens, setPersonagens] = useState([]);
  const [criancaId, setCriancaId] = useState(null);
  const [animandoId, setAnimandoId] = useState(null);
  const [mostrarConfete, setMostrarConfete] = useState(false);
  const navigate = useNavigate();

  const imagens = {
    "dentista_transparente.png": dentista,
    "fada_transparente.png": fada,
    "monstro_transparente.png": monstro,
    "principe_transparente.png": principe,
    "rei_transparente.png": rei,
  };

  // Buscar criança
  useEffect(() => {
    localStorage.removeItem("notificacao_personagem");
    async function buscarCrianca() {
      const token = localStorage.getItem("access");

      const response = await fetch(
        "http://127.0.0.1:8000/api/game/obter-perfil/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      setCriancaId(data.id);
    }

    buscarCrianca();
  }, []);

  useEffect(() => {
    if (!criancaId) return;
    carregarPersonagens();
  }, [criancaId]);

  async function carregarPersonagens() {
    const token = localStorage.getItem("access");

    const response = await fetch(
      `http://127.0.0.1:8000/api/game/personagens/${criancaId}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    setPersonagens(Array.isArray(data) ? data : []);
  }

  async function desbloquear(personagemId) {
    const token = localStorage.getItem("access");

    const response = await fetch(
      "http://127.0.0.1:8000/api/game/desbloquear-personagem/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crianca_id: criancaId,
          personagem_id: personagemId,
        }),
      }
    );

    if (response.ok) {
      setPersonagens((prev) =>
        prev.map((p) =>
          p.id === personagemId ? { ...p, desbloqueado: true } : p
        )
      );

      setAnimandoId(personagemId);

      setTimeout(() => {
        setMostrarConfete(true);
      }, 800);

      setTimeout(() => {
        setAnimandoId(null);
        setMostrarConfete(false);
        carregarPersonagens();
      }, 5000);
    }
  }

  async function ativar(personagemId) {
    const token = localStorage.getItem("access");

    await fetch(
      "http://127.0.0.1:8000/api/game/ativar_personagem/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crianca_id: criancaId,
          personagem_id: personagemId,
        }),
      }
    );

    carregarPersonagens();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F3F4F6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* ANIMAÇÃO IGUAL PERFIL */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes unlockAnim {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.4) rotate(-20deg); }
          100% { transform: scale(0); opacity: 0; }
        }

        @keyframes glowBlue {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1.4); }
        }

        @keyframes bounceUnlock {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }

        .personagens-card {
          width: 100%;
          max-width: 900px;
          background-color: #fff;
          border-radius: 35px;
          box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
          overflow: hidden;
          animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>

      {mostrarConfete && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={1000}
          recycle={false}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}

      <div className="personagens-card">
        <div
          style={{
            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
            padding: "30px",
            color: "white",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0, fontWeight: "800" }}>
            👑 Escolha seu herói!
          </h1>
        </div>

        <div style={{ padding: "30px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "25px",
            }}
          >
            {personagens.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: "25px",
                  borderRadius: "25px",
                  backgroundColor: "#fff",
                  border: p.ativo
                    ? "3px solid #8B5CF6"
                    : "1px solid #E5E7EB",
                  position: "relative",
                  textAlign: "center",
                }}
              >
                {(!p.desbloqueado || animandoId === p.id) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      fontSize: "26px",
                      animation:
                        animandoId === p.id
                          ? "unlockAnim 0.7s ease forwards"
                          : "none",
                    }}
                  >
                    {animandoId === p.id ? "🔓" : "🔒"}
                  </div>
                )}

                <div
                  style={{
                    width: "140px",
                    height: "140px",
                    margin: "0 auto 15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {animandoId === p.id && (
                    <div
                      style={{
                        position: "absolute",
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(79,172,254,0.7) 0%, rgba(0,242,254,0.4) 40%, transparent 70%)",
                        animation: "glowBlue 1.5s ease-out forwards",
                      }}
                    />
                  )}

                  <img
                    src={imagens[p.asset_nome]}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      filter: p.desbloqueado
                        ? "none"
                        : "grayscale(100%)",
                      animation:
                        animandoId === p.id
                          ? "bounceUnlock 0.6s ease"
                          : "none",
                    }}
                  />
                </div>

                <h3>{p.nome}</h3>

                {!p.desbloqueado && p.pode_desbloquear && (
                  <button
                    onClick={() => desbloquear(p.id)}
                    style={{
                      background:
                        "linear-gradient(90deg, #8B5CF6, #6366F1)",
                      color: "white",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "15px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Desbloquear
                  </button>
                )}

                {p.desbloqueado && !p.ativo && (
                  <button
                    onClick={() => ativar(p.id)}
                    style={{
                      background:
                        "linear-gradient(90deg, #10B981, #34D399)",
                      color: "white",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "15px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Selecionar
                  </button>
                )}

                {p.ativo && (
                  <div
                    style={{
                      marginTop: "10px",
                      color: "#8B5CF6",
                      fontWeight: "800",
                    }}
                  >
                    ⭐ Ativo
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              onClick={() => navigate("/jogo")}
              style={{
                padding: "14px 30px",
                borderRadius: "20px",
                border: "none",
                background:
                  "linear-gradient(90deg, #4facfe, #00f2fe)",
                color: "white",
                fontWeight: "800",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              🎮 Quero jogar de novo!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}