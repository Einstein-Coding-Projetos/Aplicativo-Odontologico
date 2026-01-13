import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ProfilePage.jsx
 * - Lê sessão do login (odonto_session)
 * - Lê jogador salvo (odonto_players)
 * - Mostra pontos, badges e progresso
 * - Logout remove sessão
 */

const STORAGE_KEYS = {
  players: "odonto_players",
  session: "odonto_session",
};

export default function ProfilePage() {
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);

  // ===== Helpers =====
  const getSession = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.session));
    } catch {
      return null;
    }
  };

  const getPlayers = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.players)) || {};
    } catch {
      return {};
    }
  };

  // ===== Proteção da rota + carregar dados =====
  useEffect(() => {
    const session = getSession();

    if (!session?.userId) {
      navigate("/login");
      return;
    }

    if (session.guest) {
      setPlayer({
        name: "Convidado(a)",
        points: 0,
        badges: [],
        guest: true,
      });
      return;
    }

    const players = getPlayers();
    const currentPlayer = players[session.userId];

    if (!currentPlayer) {
      navigate("/login");
      return;
    }

    setPlayer(currentPlayer);
  }, [navigate]);

  // ===== Logout =====
  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    navigate("/login");
  };

  if (!player) return null;

  // ===== Pontos =====
  const totalPoints = player.points || 0;

  // ===== Badges infantis =====
  const allBadges = [
    { name: "Sorriso Iniciante 😁", min: 0 },
    { name: "Amigo da Escova 🪥", min: 50 },
    { name: "Caçador de Germes 👾", min: 100 },
    { name: "Mestre do Sorriso 😄", min: 200 },
    { name: "Rei da Escovação 👑🪥", min: 300 },
  ];

  const earnedBadges = allBadges.filter(
    (badge) => totalPoints >= badge.min
  );

  // ===== Render =====
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Meu Perfil 🦷</h1>

        <p style={styles.name}>
          Olá, <strong>{player.name}</strong>!
        </p>

        {/* Pontos */}
        <div style={styles.box}>
          <h2>⭐ Pontos</h2>
          <p style={styles.points}>{totalPoints}</p>
        </div>

        {/* Badges */}
        <div style={styles.box}>
          <h2>🏅 Badges</h2>

          {earnedBadges.length === 0 ? (
            <p>Ainda não ganhou badges 😢</p>
          ) : (
            <ul style={styles.badgeList}>
              {earnedBadges.map((badge, index) => (
                <li key={index} style={styles.badge}>
                  {badge.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Botões */}
        <button style={styles.button} onClick={() => navigate("/home")}>
          Voltar ao jogo 🎮
        </button>

        <button
          style={{ ...styles.button, background: "#ef4444" }}
          onClick={handleLogout}
        >
          Sair do jogo 🚪
        </button>
      </div>
    </div>
  );
}

// ===== Estilos =====
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0fdf4",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    marginBottom: 16,
  },
  box: {
    background: "#ecfeff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  points: {
    fontSize: 32,
    fontWeight: "bold",
    margin: 0,
  },
  badgeList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  badge: {
    background: "#bbf7d0",
    borderRadius: 20,
    padding: "8px 12px",
    marginBottom: 8,
    fontWeight: "bold",
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "none",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    background: "#22c55e",
    color: "#fff",
    marginBottom: 10,
  },
};


