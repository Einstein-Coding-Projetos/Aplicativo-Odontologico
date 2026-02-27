import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

// =========================
// COMPONENTES (SEM MUDAR FUNÇÃO)
// =========================

// Componente visual simples para as Barras de Progresso (inspirado na imagem)
const StatBar = ({ label, value, max, color, showMax = false }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          fontSize: "0.85rem",
          color: "rgba(15,23,42,0.70)",
          fontWeight: 800,
        }}
      >
        <span>{label}</span>
        <span>
          {value}
          {showMax ? ` / ${max}` : ""}
        </span>
      </div>

      {/* Trilho (sem sombra) */}
      <div
        style={{
          width: "100%",
          height: "10px",
          backgroundColor: "rgba(15,23,42,0.08)",
          borderRadius: "999px",
          overflow: "hidden",
          border: "3px solid rgba(15,23,42,0.14)",
        }}
      >
        {/* Preenchimento (sem sombra) */}
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "999px",
            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
};

// Componente para renderizar estrelas proporcionais ao nível
const MAX_LEVEL = 10;

const StarRating = ({ level }) => {
  const safeLevel = Math.max(1, Math.min(level, MAX_LEVEL));
  const percentage = ((safeLevel - 1) / (MAX_LEVEL - 1)) * 100;

  return (
    <div style={{ position: "relative", display: "inline-block", fontSize: "1.2rem", lineHeight: 1 }}>
      <div style={{ color: "rgba(255,255,255,0.55)" }}>★★★★★</div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${percentage}%`,
          overflow: "hidden",
          color: "#FCD34D",
          whiteSpace: "nowrap",
        }}
      >
        ★★★★★
      </div>
    </div>
  );
};

export default function Perfil() {
  const { user, logout } = useContext(AuthContext);
  const [perfil, setPerfil] = useState(null);
  const [erro, setErro] = useState(null);
  const [showBadges, setShowBadges] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editType, setEditType] = useState("");

  useEffect(() => {
    // Injeta a fonte Nunito
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    async function fetchPerfil() {
      if (!user) return;

      const token = localStorage.getItem("access");

      if (!token) {
        setErro("Usuário não autenticado.");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/game/obter-perfil/", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (response.status === 401) {
          setErro("Sessão expirada. Faça login novamente.");
          return;
        }

        if (!response.ok) {
          setErro("Erro ao carregar perfil.");
          return;
        }

        const data = await response.json();
        setPerfil(data);
        setErro(null);
      } catch (error) {
        setErro("Erro de conexão com o servidor.");
      }
    }

    fetchPerfil();
  }, [user, logout]);

  // =========================
  // TELAS DE ERRO / LOADING (SEM EXCESSO DE SOMBRAS)
  // =========================
  if (erro)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#A855F7",
          fontFamily: "'Nunito', sans-serif",
          padding: 18,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            padding: "26px",
            borderRadius: "22px",
            border: "4px solid rgba(15,23,42,0.16)",
            boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
            textAlign: "center",
            maxWidth: 420,
            width: "100%",
          }}
        >
          <h3
            style={{
              color: "#EF4444",
              margin: 0,
              fontWeight: 900,
              fontSize: "1.6rem",
              textShadow: "2px 2px 0 rgba(15,23,42,0.18)",
            }}
          >
            Ops!
          </h3>
          <p style={{ color: "rgba(15,23,42,0.70)", fontWeight: 800 }}>{erro}</p>

          <button
            onClick={logout}
            style={{
              marginTop: "12px",
              padding: "12px 18px",
              background: "#EF4444",
              color: "white",
              border: "4px solid rgba(15,23,42,0.16)",
              borderRadius: "16px",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Sair
          </button>
        </div>
      </div>
    );

  if (!perfil)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#A855F7",
          color: "rgba(255,255,255,0.95)",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 900,
          fontSize: "1.05rem",
          textShadow: "2px 2px 0 rgba(15,23,42,0.20)",
        }}
      >
        Carregando seu perfil...
      </div>
    );

  // =========================
  // LÓGICA (NÃO MEXER)
  // =========================
  const XP_POR_NIVEL = 2000;
  const isMaxLevel = perfil.nivel >= 10;
  const xpAtual = isMaxLevel ? XP_POR_NIVEL : perfil.pontos_totais % XP_POR_NIVEL;

  const handleUpdate = async (e) => {
    e.preventDefault();
    const valor = e.target.valor.value;
    const token = localStorage.getItem("access");

    const body = editType === "email" ? { email: valor } : { senha: valor };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/game/atualizar-usuario/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert("Atualizado com sucesso!");
        setShowEdit(false);
        window.location.reload();
      } else {
        alert("Erro ao atualizar.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  // =========================
  // ESTILO (CORES NOVAS)
  // =========================
  const BIG_CARD_SHADOW = "0 18px 36px rgba(0,0,0,0.20)";
  const TITLE_SHADOW = "2px 2px 0 rgba(15,23,42,0.22)";

  // Paleta roxa (na vibe do background, mais escura)
  const PURPLE_DARK_1 = "#6527c2"; // roxo escuro
  const PURPLE_DARK_2 = "#6527c2"; // mais profundo
  const PURPLE_BTN_1 = "#eb96fa";  // botão roxo
  const PURPLE_BTN_2 = "#eb96fa";  // botão roxo mais escuro

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#A855F7",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .profile-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.18);
          border-radius: 34px;
          overflow: hidden;
          position: relative;
          animation: slideUpFade 0.65s cubic-bezier(0.2, 0.8, 0.2, 1);
          border: 6px solid rgba(255,255,255,0.65);
          box-shadow: ${BIG_CARD_SHADOW};
          backdrop-filter: blur(6px);
        }

        @media (min-width: 768px) {
          .profile-card {
            max-width: 920px;
            width: 92%;
          }
        }
      `}</style>

      <div className="profile-card">
        {/* HEADER (AGORA ROXO ESCURO) */}
        <div
          style={{
            background: `linear-gradient(135deg, ${PURPLE_DARK_1}, ${PURPLE_DARK_2})`,
            padding: "30px 25px 52px 25px",
            color: "white",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "102px",
              height: "102px",
              margin: "0 auto 14px",
              padding: "4px",
              background: "rgba(255,255,255,0.25)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "4px solid rgba(15,23,42,0.12)",
            }}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                perfil.nome
              )}&background=FCD34D&color=B45309&size=128&bold=true`}
              alt="Avatar"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid rgba(255,255,255,0.95)",
              }}
            />
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "1.55rem",
              fontWeight: 1000,
              letterSpacing: "0.4px",
              textShadow: TITLE_SHADOW,
            }}
          >
            {perfil.nome}
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: "0.9rem",
              opacity: 0.95,
              fontWeight: 800,
            }}
          >
            {perfil.email || "Sem e-mail cadastrado"}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "8px",
              alignItems: "center",
              fontWeight: 900,
            }}
          >
            <span style={{ fontSize: "0.95rem", opacity: 0.95 }}>Nível {perfil.nivel}</span>
            <StarRating level={perfil.nivel} />
          </div>
        </div>

        {/* CONTEÚDO */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.96)",
            marginTop: "-24px",
            borderRadius: "30px 30px 0 0",
            padding: "25px",
            position: "relative",
            borderTop: "6px solid rgba(15,23,42,0.12)",
          }}
        >
          {/* 👑 PERSONAGEM ATIVO */}
          {perfil.personagem_ativo && (
            <div
              style={{
                marginBottom: "22px",
                padding: "18px",
                borderRadius: "22px",
                backgroundColor: "white",
                border: "4px solid rgba(15,23,42,0.10)",
                boxShadow: BIG_CARD_SHADOW,
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "1.55rem",
                  fontWeight: 1000,
                  color: "rgba(15,23,42,0.86)",
                  textShadow: TITLE_SHADOW,
                }}
              >
                👑 Seu herói da vez!
              </h3>

              <div
                style={{
                  width: "116px",
                  height: "116px",
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={new URL(`../assets/${perfil.personagem_ativo.asset_nome}`, import.meta.url).href}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </div>

              <p style={{ marginTop: "10px", fontWeight: 900, color: "rgba(15,23,42,0.72)" }}>
                {perfil.personagem_ativo.nome}
              </p>
            </div>
          )}

          {/* TÍTULO SEÇÃO */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3
              style={{
                margin: 0,
                fontSize: "1.15rem",
                color: "rgba(15,23,42,0.86)",
                fontWeight: 1000,
                textShadow: "none",
              }}
            >
              Estatísticas
            </h3>

            <span
              style={{
                background: "#FEF7D5",
                color: "#846a93",
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 1000,
                textTransform: "uppercase",
                border: "3px solid #F5D565",
              }}
            >
              {perfil.badges.length > 0 ? perfil.badges[perfil.badges.length - 1] : "Escovador iniciante"}
            </span>
          </div>

          {/* CARD STATS */}
          <div
            style={{
              padding: "18px",
              borderRadius: "22px",
              backgroundColor: "white",
              border: "4px solid rgba(15,23,42,0.10)",
              boxShadow: BIG_CARD_SHADOW,
              marginBottom: "26px",
            }}
          >
            <StatBar
              label={isMaxLevel ? "Nível Máximo Alcançado!" : `XP para o Nível ${perfil.nivel + 1}`}
              value={xpAtual}
              max={XP_POR_NIVEL}
              color={isMaxLevel ? "#C026D3" : "#8B5CF6"}
              showMax={true}
            />

            {/* BARRA DE CONQUISTAS -> PREENCHIMENTO BRANCO */}
            {perfil.proximo_badge ? (
              <StatBar
                label={`Próxima Conquista: ${perfil.proximo_badge.nome}`}
                value={perfil.pontos_totais}
                max={perfil.proximo_badge.pontos}
                color="#FFFFFF"   // <-- AQUI (preenchida de branco)
                showMax={true}
              />
            ) : (
              <StatBar label="Todas as conquistas desbloqueadas!" value={100} max={100} color="#7E22CE" showMax={false} />
            )}

            <StatBar label="Partidas Jogadas" value={perfil.historico ? perfil.historico.length : 0} max={50} color="#EB96FA" />

            <StatBar label="Medalhas Conquistadas" value={perfil.badges.length} max={10} color="#F5D0FE" />

            {/* BOTÃO VER CONQUISTAS -> ROXO DA PALETA */}
            <button
              onClick={() => setShowBadges(true)}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "12px",
                background: `linear-gradient(90deg, ${PURPLE_BTN_1} 0%, ${PURPLE_BTN_2} 100%)`,
                color: "white",
                border: "4px solid rgba(15,23,42,0.12)",
                borderRadius: "18px",
                fontWeight: 1000,
                fontSize: "1.2rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              ⭐️ VER CONQUISTAS ⭐️
            </button>
          </div>

          {/* HISTÓRICO */}
          <h3
            style={{
              margin: "0 0 14px 0",
              fontSize: "1.15rem",
              color: "rgba(15,23,42,0.86)",
              fontWeight: 1000,
              textShadow: "none",
            }}
          >
            Histórico Recente
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "18px" }}>
            {perfil.historico && perfil.historico.length > 0 ? (
              perfil.historico.slice(0, 3).map((partida, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "20px",
                    backgroundColor: "white",
                    border: "4px solid rgba(15,23,42,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "16px",
                      backgroundColor: "#ECFDF5",
                      color: "#10B981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                      marginRight: "14px",
                      border: "3px solid rgba(15,23,42,0.08)",
                    }}
                  >
                    🦠
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 1000, color: "rgba(15,23,42,0.80)", fontSize: "0.98rem" }}>
                      Jogo dos Germes
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(15,23,42,0.45)", fontWeight: 800 }}>
                      {partida.data}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 1000, color: "#8B5CF6" }}>+{partida.pontos}</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(15,23,42,0.35)", fontWeight: 1000 }}>
                      PTS
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "18px", color: "rgba(15,23,42,0.50)", fontSize: "0.95rem", fontWeight: 900 }}>
                Nenhuma partida recente.
              </div>
            )}
          </div>

          {/* Opções de Conta */}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={() => {
                setEditType("email");
                setShowEdit(true);
              }}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#eb96fa8a",
                border: "4px solid rgba(15,23,42,0.10)",
                borderRadius: "16px",
                color: "rgba(15,23,42,0.75)",
                fontWeight: 1000,
                cursor: "pointer",
              }}
            >
              Alterar E-mail
            </button>

            <button
              onClick={() => {
                setEditType("senha");
                setShowEdit(true);
              }}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#eb96fa8a",
                border: "4px solid rgba(15,23,42,0.10)",
                borderRadius: "16px",
                color: "rgba(15,23,42,0.75)",
                fontWeight: 1000,
                cursor: "pointer",
              }}
            >
              Redefinir Senha
            </button>
          </div>

          <button
            onClick={logout}
            style={{
              width: "100%",
              marginTop: "14px",
              padding: "12px",
              backgroundColor: "#EF4444",
              color: "white",
              border: "4px solid rgba(15,23,42,0.12)",
              borderRadius: "18px",
              fontWeight: 1000,
              cursor: "pointer",
            }}
          >
            SAIR DA CONTA
          </button>
        </div>
      </div>

      {/* MODAL CONQUISTAS */}
      {showBadges && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15,23,42,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: 18,
          }}
          onClick={() => setShowBadges(false)}
        >
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.98)",
              padding: "24px",
              borderRadius: "24px",
              maxWidth: "340px",
              width: "100%",
              textAlign: "center",
              border: "4px solid rgba(15,23,42,0.14)",
              boxShadow: BIG_CARD_SHADOW,
              animation: "slideUpFade 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "rgba(15,23,42,0.86)",
                marginTop: 0,
                fontSize: "1.55rem",
                fontWeight: 1000,
                textShadow: TITLE_SHADOW,
              }}
            >
              🏅 Suas Conquistas
            </h3>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", margin: "18px 0" }}>
              {perfil.badges.length > 0 ? (
                perfil.badges.map((badge, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "#FEF3C7",
                      color: "#B45309",
                      padding: "8px 12px",
                      borderRadius: "999px",
                      fontWeight: 1000,
                      fontSize: "0.9rem",
                      border: "3px solid rgba(15,23,42,0.10)",
                    }}
                  >
                    {badge}
                  </div>
                ))
              ) : (
                <p style={{ color: "rgba(15,23,42,0.65)", fontWeight: 900 }}>Jogue mais para desbloquear conquistas!</p>
              )}
            </div>

            <button
              onClick={() => setShowBadges(false)}
              style={{
                padding: "12px 22px",
                backgroundColor: "#EF4444",
                color: "white",
                border: "4px solid rgba(15,23,42,0.12)",
                borderRadius: "16px",
                cursor: "pointer",
                fontWeight: 1000,
                fontSize: "1rem",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDIÇÃO */}
      {showEdit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15,23,42,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: 18,
          }}
          onClick={() => setShowEdit(false)}
        >
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.98)",
              padding: "24px",
              borderRadius: "24px",
              maxWidth: "340px",
              width: "100%",
              textAlign: "center",
              border: "4px solid rgba(15,23,42,0.14)",
              boxShadow: BIG_CARD_SHADOW,
              animation: "slideUpFade 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "rgba(15,23,42,0.86)",
                marginTop: 0,
                fontSize: "1.35rem",
                fontWeight: 1000,
                textShadow: TITLE_SHADOW,
              }}
            >
              {editType === "email" ? "Novo E-mail" : "Nova Senha"}
            </h3>

            <form onSubmit={handleUpdate}>
              <input
                name="valor"
                type={editType === "senha" ? "password" : "email"}
                placeholder={editType === "email" ? "Digite o novo e-mail" : "Digite a nova senha"}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  margin: "15px 0",
                  borderRadius: "16px",
                  border: "4px solid rgba(15,23,42,0.12)",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                  fontWeight: 900,
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "rgba(15,23,42,0.06)",
                    color: "rgba(15,23,42,0.75)",
                    border: "4px solid rgba(15,23,42,0.12)",
                    borderRadius: "16px",
                    cursor: "pointer",
                    fontWeight: 1000,
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#10B981",
                    color: "white",
                    border: "4px solid rgba(15,23,42,0.12)",
                    borderRadius: "16px",
                    cursor: "pointer",
                    fontWeight: 1000,
                  }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}