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
        prev.map((p) => (p.id === personagemId ? { ...p, desbloqueado: true } : p))
      );

      setAnimandoId(personagemId);

      setTimeout(() => setMostrarConfete(true), 800);

      setTimeout(() => {
        setAnimandoId(null);
        setMostrarConfete(false);
        carregarPersonagens();
      }, 5000);
    }
  }

  async function ativar(personagemId) {
    const token = localStorage.getItem("access");

    await fetch("http://127.0.0.1:8000/api/game/ativar_personagem/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        crianca_id: criancaId,
        personagem_id: personagemId,
      }),
    });

    carregarPersonagens();
  }

  return (
    <div className="personagens-page">
      <style>{css}</style>

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
        <div className="card-header">
          <h1 className="card-title">Escolha seu herói!</h1>
          <span className="card-subtitle"></span>
        </div>

        <div className="card-body">
          <div className="grid">
            {personagens.map((p) => (
              <div key={p.id} className={`char-card ${p.ativo ? "active" : ""}`}>
                {(!p.desbloqueado || animandoId === p.id) && (
                  <div
                    className="lock"
                    style={{
                      animation:
                        animandoId === p.id ? "unlockAnim 0.7s ease forwards" : "none",
                    }}
                  >
                    {animandoId === p.id ? "🔓" : "🔒"}
                  </div>
                )}

                <div className="avatar">
                  {animandoId === p.id && <div className="glow" />}

                  <img
                    src={imagens[p.asset_nome]}
                    alt={p.nome}
                    style={{
                      filter: p.desbloqueado ? "none" : "grayscale(100%)",
                      animation: animandoId === p.id ? "bounceUnlock 0.6s ease" : "none",
                    }}
                  />
                </div>

                <h3 className="name">{p.nome}</h3>

                {!p.desbloqueado && p.pode_desbloquear && (
                  <button className="btn btn-purple" onClick={() => desbloquear(p.id)}>
                    Desbloquear
                  </button>
                )}

                {p.desbloqueado && !p.ativo && (
                  <button className="btn btn-green" onClick={() => ativar(p.id)}>
                    Selecionar
                  </button>
                )}

                {p.ativo && <div className="active-tag">⭐ Ativo</div>}
              </div>
            ))}
          </div>

          <div className="footer-cta">
            <button className="cta" onClick={() => navigate("/jogo")}>
              Quero jogar de novo!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
:root{
  --green: #00f2fe;
  --red: #E15148;
  --ink: #0f172a;
}

/* BG sólido */
.personagens-page{
  min-height: 100vh;
  width: 100vw;
  background: var(--green);
  display:flex;
  justify-content:center;
  align-items:center;
  padding: 42px 18px 60px;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  font-family: "Nunito", system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}

/* animações */
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

/* CARD com “moldura” (borda cinza tipo print) */
.personagens-card{
  width: 100%;
  max-width: 980px;
  background-color: #fff;
  border-radius: 34px;
  overflow: hidden;
  animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  backdrop-filter: blur(6px);
  
  /* borda cinza externa */
  border: 6px solid rgba(255,255,255,0.55);
  box-shadow: 0 16px 0 rgba(255,255,255,0.12), 0 26px 50px rgba(0,0,0,0.18);
  background: rgba(255,255,255,0.20);
}

/* header sólido */
.card-header{
  background: #158d94;
  color: white;
  padding: 22px 26px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}

/* TÍTULO com sombra igual estilo do ranking */
.card-title{
  margin: 0;
  font-family: "Nunito", system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  font-weight: 900;
  font-size: 2.2rem;

  /* sombra “cartoon” */
  text-shadow:
    2px 2px 0 rgba(0,0,0,0.14), 0 6px 0px rgba(0,0,0,0.14);
}

.card-subtitle{
  font-weight: 800;
  opacity: 0.95;
  font-size: clamp(12px, 1.3vw, 14px);
  white-space: nowrap;
}

.card-body{
padding: 30px; 
background: rgba(255,255,255,0.92);
border-top-left-radius: 3px;
border-top-right-radius: 3px;
padding: 30px;
box-sizing: border-box;
}

/* grid */
.grid{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
}

/* cards */
.char-card{
  padding: 25px;
  border-radius: 25px;
  background-color: #fff;
  border: 1px solid #E5E7EB;
  position: relative;
  text-align: center;
}
.char-card.active{
  border: 3px solid rgba(0, 184, 194, 0.9);
}

.lock{
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 26px;
}

.avatar{
  width: 140px;
  height: 140px;
  margin: 0 auto 15px;
  display:flex;
  align-items:center;
  justify-content:center;
  position: relative;
}
.avatar img{
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.glow{
  position:absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79,172,254,0.7) 0%, rgba(0,242,254,0.4) 40%, transparent 70%);
  animation: glowBlue 1.5s ease-out forwards;
}

.name{
  margin: 6px 0 14px;
  font-weight: 900;
  color: rgba(15,23,42,0.85);
}

/* botões */
.btn{
  border: none;
  padding: 10px 18px;
  border-radius: 15px;
  font-weight: 800;
  cursor: pointer;
}
.btn-purple{ background: #6366F1; color: white; }
.btn-green{ background: #10B981; color: white; }

.active-tag{
  margin-top: 10px;
  color: #00b8c2;
  font-weight: 900;
}

.footer-cta{
  text-align:center;
  margin-top: 40px;
}
.cta{
  padding: 14px 30px;
  border-radius: 20px;
  border: none;
  background: #158d94;
  color: white;
  font-weight: 900;
  font-size: 1.5rem;
  cursor: pointer;
  font-family: "Nunito", system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}
.cta:hover{ background: var(--red); }

@media (max-width: 560px){
  .card-subtitle{ display:none; }
}
`;