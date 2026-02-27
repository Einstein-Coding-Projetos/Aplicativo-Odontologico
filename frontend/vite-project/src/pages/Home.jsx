import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

function Home() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  const folders = useMemo(
    () => [
      // De trás -> pra frente (a ÚLTIMA fica na frente e embaixo)
      { id: "personagens", label: "Personagens", route: "/personagens", color: "#00f2fe", tabText: "Personagens" },
      { id: "perfil", label: "Perfil", route: "/perfil", color: "#A855F7", tabText: "Perfil" },
      { id: "ranking", label: "Ranking", route: "/ranking", color: "#8BA26E", tabText: "Ranking" },
      { id: "questionario", label: "Questionário", route: "/questionario", color: "#E9B463", tabText: "Questionário" },
      { id: "jogo", label: "Jogo dos Germes", route: "/jogo", color: "#E15148", tabText: "Jogo dos Germes" }, // <- frente
    ],
    []
  );

  // Ajustes do empilhamento
  const PEEK = 70; // quanto uma pasta "aparece" da outra (altura do “degrau”)
  const FOLDER_H = 260; // altura de cada folder
  const stackHeight = FOLDER_H + PEEK * (folders.length - 1) + 24;

  // Ajustes da diagonal das abas
  const TAB_BASE_LEFT = 56; // posição inicial
  const TAB_STEP = 194; // quanto cada aba anda pro lado (diagonal)

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Menu Principal</h1>

      <div style={{ ...styles.stack, height: stackHeight }}>
        {folders.map((f, index) => {
          const isHovered = hoveredId === f.id;

          // backmost = index 0 (mais alto), frontmost = último (mais baixo)
          const bottomBase = (folders.length - 1 - index) * PEEK;
          const zBase = index;

          return (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(f.route)}
              onKeyDown={(e) => e.key === "Enter" && navigate(f.route)}
              onMouseEnter={() => setHoveredId(f.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                ...styles.folder,
                background: f.color,
                bottom: isHovered ? bottomBase + 125 : bottomBase, // hover sobe
                zIndex: zBase,
                transform: isHovered ? "translateY(-2px)" : "translateY(0px)",
                boxShadow: isHovered
                  ? "0 22px 0px rgba(0,0,0,0.22)"
                  : "0 14px 26px rgba(0,0,0,0.15)",
              }}
            >
              {/* ABA EM DIAGONAL */}
              <div
                style={{
                  ...styles.tab,
                  left: `${TAB_BASE_LEFT + index * TAB_STEP}px`,
                }}
              >
                <span style={styles.tabText}>{f.tabText}</span>
              </div>

              <div style={styles.folderBody}>
                <div style={styles.folderLabel}>{f.label}</div>
                <div style={styles.folderHint}>Clique para abrir</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#4facfe",
    minHeight: "100vh",
    position: "relative",
    fontFamily: "'Nunito', sans-serif",
    color: "#fff",
    overflow: "hidden",
  },

  title: {
  position: "absolute",
  top: "10px",
  left: "40px",
  fontSize: "4.2rem", // pode ajustar
  fontWeight: 900,
  zIndex: 20,
  color: "rgba(255,255,255,0.95)",
  textShadow: "0 4px 0 rgba(0,0,0,0.18), 0 14px 22px rgba(0,0,0,0.18)",
},

  // Pilha: largura quase total e colada embaixo
  stack: {
    position: "absolute",
    left: "24px",
    right: "24px",
    bottom: "45px",
    margin: "0 auto",
  },

  folder: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "260px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.18)",
    boxShadow: "0 8px 0 rgba(255,255,255,0.12), 0 12px 18px rgba(0,0,0,0.15)",
    cursor: "pointer",
    userSelect: "none",
    transition: "transform 180ms ease, bottom 180ms ease, box-shadow 180ms ease",
    border: "8px solid rgba(255,255,255,0.55)",

    // textura leve tipo “papel”
    backgroundImage: "none",
    backgroundBlendMode: "normal",
  },

  tab: {
    position: "absolute",
    top: "-16px",
    height: "40px",
    width: "160px",
    borderRadius: "14px 14px 6px 6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "5px solid rgba(255,255,255,0.55)",
    borderBottom: "none",
    background: "rgba(0,0,0,0.12)",
    boxShadow: "0 10px 18px rgba(0,0,0,0.10)",
    backdropFilter: "blur(3px)",
  },

  tabText: {
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "rgba(255,255,255,0.9)",
    textTransform: "lowercase",
    letterSpacing: "0.5px",
    textShadow: "0 2px 6px rgba(0,0,0,0.25)",
  },

  folderBody: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "40px 48px 28px 48px",
    gap: "10px",
  },

  folderLabel: {
    fontSize: "3.6rem",
    fontWeight: 900,
    lineHeight: 1.05,
    color: "rgba(255,255,255,0.92)",
    textShadow: "0 4px 0 rgba(0,0,0,0.18), 0 14px 22px rgba(0,0,0,0.18)",
  },

  folderHint: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.75)",
    textShadow: "0 4px 12px rgba(0,0,0,0.20)",
  },
};

export default Home;