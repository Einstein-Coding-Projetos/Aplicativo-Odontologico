import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEYS = {
  players: "odonto_players",
  session: "odonto_session",
};

// Paleta oficial (hex direto, sem variáveis CSS)
const COLORS = {
  quiz01: "#5FA869", // verde
  quiz02: "#2C76A3", // azul
  quiz03: "#E9B463", // âmbar
  quiz04: "#E15148", // vermelho
  ink:    "#1d2230",
  muted:  "#4b5563",
  card:   "#ffffff",
  line:   "#d1d5db",
  shadow: "0 10px 30px rgba(0,0,0,0.08)",
  bgGrad: "linear-gradient(180deg, #e0f7fb 0%, #ffffff 60%)",
};

function getSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.session)) || null; }
  catch { return null; }
}
function getPlayers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.players)) || {}; }
  catch { return {}; }
}

export default function ModeSelectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [welcome, setWelcome] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s?.userId) { navigate("/login", { replace: true }); return; }
    const players = getPlayers();
    const player = players[s.userId];
    const displayName = player?.name || (s.guest ? "Convidado(a)" : "Jogador(a)");
    setName(displayName);
    setWelcome(s.welcome || `Olá, ${displayName}!`);
  }, [navigate]);

  const goGame = () => navigate("/game");
  const goQuiz = () => navigate("/quiz");
  const logout = () => { localStorage.removeItem(STORAGE_KEYS.session); navigate("/login", { replace: true }); };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div aria-hidden style={styles.topBar} />
        <header style={styles.header}>
          <div aria-hidden style={styles.mascot}>🦷</div>
          <h1 style={styles.title}>{welcome.replace("Olá", "Bem-vindo(a) de volta")}</h1>
          <p style={styles.subtitle}>Escolha para onde deseja ir, {name.split(" ")[0]}.</p>
        </header>

        <div style={styles.grid}>
          <button onClick={goGame} style={{ ...styles.choiceBtn, ...styles.primary }}>
            <span>🎮 Jogar</span>
            <span style={styles.hint}>Jogo dos germes</span>
          </button>

          <button onClick={goQuiz} style={{ ...styles.choiceBtn, ...styles.secondary }}>
            <span>📝 Perguntas</span>
            <span style={styles.hint}>Quiz de saúde bucal</span>
          </button>

          <button onClick={logout} style={{ ...styles.choiceBtn, ...styles.ghost }}>
            <span>🚪 Sair</span>
            <span style={styles.hint}>Encerrar sessão</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    background: COLORS.bgGrad,
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: COLORS.card,
    borderRadius: 20,
    boxShadow: COLORS.shadow,
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  topBar: {
    height: 84,
    width: "calc(100% + 48px)",
    margin: "-24px -24px 12px",
    background: `linear-gradient(135deg, ${COLORS.quiz02} 0%, ${COLORS.quiz01} 100%)`,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  header: { textAlign: "center", marginBottom: 18 },
  mascot: { fontSize: 40, marginBottom: 6 },
  title: { margin: 0, fontSize: 22, color: COLORS.ink, fontWeight: 800 },
  subtitle: { margin: "6px 0 14px", color: COLORS.muted, fontSize: 14 },

  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 12 },

  choiceBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    width: "100%",
    padding: "16px 14px",
    borderRadius: 14,
    border: `1px solid ${COLORS.line}`,
    background: "#fff",
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: 800,
    cursor: "pointer",
    transition: "transform .06s ease, box-shadow .2s ease, filter .2s ease",
  },
  hint: { fontSize: 12, color: COLORS.muted, fontWeight: 500 },

   primary: {
    border: `1px solid ${COLORS.quiz01}`,
    background: "rgba(95,168,105,0.10)", // verde bem leve
    color: COLORS.quiz01,
    fontWeight: 800,
    boxShadow: `inset 4px 0 0 0 ${COLORS.quiz01}`, // faixa lateral
  },
  secondary: {
    border: `1px solid ${COLORS.quiz02}`,
    background: "rgba(44,118,163,0.06)",
    color: COLORS.quiz02,
    fontWeight: 800,
    boxShadow: `inset 4px 0 0 0 ${COLORS.quiz02}`,
  },
  ghost: {
    border: `1px solid ${COLORS.line}`,
    background: "#fff",
    color: COLORS.ink,
    fontWeight: 600,
    boxShadow: `inset 4px 0 0 0 ${COLORS.quiz04}`,
  },
};