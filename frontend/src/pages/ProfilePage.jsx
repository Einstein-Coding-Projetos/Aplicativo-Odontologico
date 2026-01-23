import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ProfilePage.jsx (Versão Híbrida)
 * - Visual: Mantém os estilos e Badges do seu projeto original.
 * - Lógica: Busca os dados do Backend (localhost:3000) em vez do localStorage antigo.
 */

export default function ProfilePage() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== Conexão com o Backend =====
  useEffect(() => {
    // 1. Pega o CPF que salvamos no Login (pelo novo sistema)
    const cpf = localStorage.getItem('userCpf');

    if (!cpf) {
      navigate("/login");
      return;
    }

    // 2. Busca os dados reais no servidor
    fetch(`http://localhost:3000/api/users/${cpf}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert('Sessão expirada ou usuário não encontrado.');
          handleLogout();
        } else {
          // Adaptação: O back envia 'coins', o front mostra como 'pontos'
          setPlayer({
            ...data,
            name: data.nome,     // O back manda 'nome', o front usa 'name'
            points: data.coins   // O back manda 'coins', o front usa 'points'
          });
        }
      })
      .catch((err) => {
        console.error("Erro ao conectar no servidor:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  // ===== Logout =====
  const handleLogout = () => {
    // Limpa os dados do novo sistema de login
    localStorage.removeItem('userCpf');
    localStorage.removeItem('userName');
    navigate("/login");
  };

  if (loading) return <div style={styles.page}><h3>Carregando perfil...</h3></div>;
  if (!player) return null;

  // ===== Lógica Visual (Mantida do seu código) =====
  const totalPoints = player.points || 0;

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

  // ===== Renderização (Mantida do seu código) =====
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

// ===== Estilos (Mantidos IDÊNTICOS aos seus) =====
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