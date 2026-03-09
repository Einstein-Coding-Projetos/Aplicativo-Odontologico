import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

// ✅ Ajuste os imports pros nomes exatos dos seus arquivos
import dentista from "../assets/dentista_transparente.png";
import rei from "../assets/rei_transparente.png";
import principe from "../assets/principe_transparente.png";
import fada from "../assets/fada_transparente.png";
import monstro from "../assets/monstro_transparente.png";

function Home() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  // ✅ NOVO: hover específico do botão (pra ficar igual login: sólido + hover muda)
  const [hoverBtnId, setHoverBtnId] = useState(null);

  const folders = useMemo(
    () => [
      {
        id: "personagens",
        label: "Personagens",
        route: "/personagens",
        color: "#00f2fe",
        tabText: "Personagens",
      },
      { id: "perfil", label: "Perfil", route: "/perfil", color: "#A855F7", tabText: "Perfil" },
      { id: "ranking", label: "Ranking", route: "/ranking", color: "#8BA26E", tabText: "Ranking" },
      {
        id: "questionario",
        label: "Questionário",
        route: "/questionario",
        color: "#E9B463",
        tabText: "Questionário",
      },
      { id: "jogo", label: "Jogo dos Germes", route: "/jogo", color: "#E15148", tabText: "Jogo dos Germes" },
    ],
    []
  );

  const PEEK = 110;
  const FOLDER_H = 260;
  const stackHeight = FOLDER_H + PEEK * (folders.length - 1) + 24;

  const TAB_BASE_LEFT = 56;
  const TAB_STEP = 140;

  const story = useMemo(
    () => [
      {
        id: "rei",
        title: "O Rei do Reino dos Dentes",
        text: "Ele protege o castelo e chama você para salvar o sorriso de todo mundo!",
        img: rei,
        accent: "rgba(22, 95, 158, 0.59)",
      },
      {
        id: "principe",
        title: "O Príncipe da Escovação",
        text: "Rápido e corajoso: ele treina você para derrotar as cáries mais teimosas!",
        img: principe,
        accent: "rgba(22, 95, 158, 0.59)",
      },
      {
        id: "dentista",
        title: "O Dentista dos Super Dentes",
        text: "Ele ensina os truques: escova, fio dental e muita coragem!",
        img: dentista,
        accent: "rgba(22, 95, 158, 0.59)",
      },
      {
        id: "fada",
        title: "A Fada do Dente",
        text: "Quando você se esforça, ela aparece com brilho e recompensa: XP e conquistas!",
        img: fada,
        accent: "rgba(22, 95, 158, 0.59)",
      },
      {
        id: "monstros",
        title: "Os Monstros da Cárie",
        text: "Eles adoram doces e bagunça… mas fogem quando você caça os germes!",
        img: monstro,
        accent: "rgba(22, 95, 158, 0.59)",
      },
    ],
    []
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Menu Principal</h1>

      <div style={styles.storyWrap}>
        <div style={styles.storyHeader}>
          <h2 style={styles.storyH2}> A História do Reino dos Dentes</h2>
          <p style={styles.storyP}>
            Conheça os heróis… e os monstros! Depois, escolha uma opcão embaixo para começar!
          </p>
        </div>

        <div style={styles.storyGrid}>
          {story.map((cena) => (
            <div key={cena.id} style={{ ...styles.storyCard, background: cena.accent }}>
              {/* ✅ TÍTULO EM “FAIXA” (ocupa o card todo) */}
              <div style={styles.storyTitleBar}>{cena.title}</div>

              {/* ✅ CONTEÚDO (imagem + texto) */}
              <div style={styles.storyRow}>
                <div style={styles.storyImgBox}>
                  <img src={cena.img} alt={cena.title} style={styles.storyImg} />
                </div>

                <div style={styles.storyTextBox}>
                  <div style={styles.storyText}>{cena.text}</div>

                  {/* ✅ BOTÃO padronizado (sólido + hover vermelho) */}
                  <div style={styles.storyBtnRow}>
                    <button
                      style={{
                        ...styles.storyBtnSolid,
                        ...(hoverBtnId === cena.id ? styles.storyBtnSolidHover : {}),
                      }}
                      onClick={() => navigate(cena.id === "monstros" ? "/jogo" : "/personagens")}
                      onMouseEnter={() => setHoverBtnId(cena.id)}
                      onMouseLeave={() => setHoverBtnId(null)}
                    >
                      {cena.id === "monstros" ? "Caçar Germes →" : "Ver personagem →"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.stack, height: stackHeight }}>
        {folders.map((f, index) => {
          const isHovered = hoveredId === f.id;

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
                bottom: isHovered ? bottomBase + 125 : bottomBase,
                zIndex: zBase,
                transform: isHovered ? "translateY(-2px)" : "translateY(0px)",
                boxShadow: isHovered ? "0 22px 0px rgba(0,0,0,0.22)" : "0 14px 26px rgba(0,0,0,0.15)",
              }}
            >
              <div style={{ ...styles.tab, left: `${TAB_BASE_LEFT + index * TAB_STEP}px` }}>
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
    overflowX: "hidden",
    overflowY: "auto",
    paddingBottom: "520px",
  },

  title: {
    position: "sticky",
    top: "0px",
    left: "40px",
    paddingTop: "10px",
    paddingLeft: "40px",
    fontSize: "4.9rem",
    fontWeight: 900,
    zIndex: 30,
    color: "rgba(255,255,255,0.95)",
    textShadow: "0 4px 0 rgba(0,0,0,0.18), 0 14px 22px rgba(0,0,0,0.18)",
    margin: 0,
    background: "linear-gradient(to bottom, rgba(63, 158, 241, 0.95), rgba(79,172,254,0.0))",
    backdropFilter: "blur(3px)",
  },

  storyWrap: {
    maxWidth: "1800px",
    margin: "0 auto",
    padding: "24px 24px 0 24px",
    marginBottom: "485px",
  },

  storyHeader: {
    marginTop: "29px",
    marginBottom: "16px",
    padding: "18px 18px",
    borderRadius: "22px",
    border: "6px solid rgba(255,255,255,0.55)",
    background: "rgba(22, 95, 158, 0.95)",
  },

  storyH2: {
    margin: 0,
    fontSize: "2.7rem",
    fontWeight: 900,
    textShadow: "0 4px 0 rgba(0,0,0,0.16)",
  },

  storyP: {
    margin: "8px 0 0 0",
    fontWeight: 700,
    opacity: 0.92,
    fontSize: "1.2rem",
  },

  storyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "16px",
    marginTop: "18px",
    alignItems: "stretch",
  },

  storyCard: {
    borderRadius: "24px",
    border: "6px solid rgba(255,255,255,0.55)",
    boxShadow: "0 14px 26px rgba(0,0,0,0.15)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "14px",
    minWidth: 0,
    minHeight: "230px",
  },

  storyTitleBar: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "16px",
    fontWeight: 900,
    fontSize: "1.15rem",
    textAlign: "center",
    color: "rgba(255,255,255,0.95)",
    background: "#4facfe8a",
    border: "0px solid rgba(255,255,255,0.35)",
    textShadow: "0 3px 0 rgba(0,0,0,0.14)",
  },

  storyRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  storyImgBox: {
    width: "110px",
    height: "110px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.18)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    border: "4px solid rgba(255,255,255,0.45)",
  },

  storyImg: {
    width: "100px",
    height: "100px",
    objectFit: "contain",
    filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.18))",
  },

  storyTextBox: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: 0,
    flex: 1,
  },

  storyText: {
    fontWeight: 700,
    opacity: 0.92,
    lineHeight: 1.25,
  },

  storyBtnRow: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "flex-start",
  },

  // ✅ NOVO: botão sólido + hover vermelho (igual login)
  storyBtnSolid: {
    border: "0",
    borderRadius: "999px",
    padding: "12px 13px", // menor que antes
    fontWeight: 800,
    fontSize: "0.95rem",
    cursor: "pointer",
    background: "#4facfe91", // azul sólido (normal)
    color: "white",
    boxShadow: "0 10px 18px rgba(0,0,0,0.12)",
    transition: "background-color 180ms ease, transform 120ms ease, box-shadow 180ms ease",
  },

  storyBtnSolidHover: {
    background: "#E15148", // vermelho no hover
    color: "white",
    boxShadow: "0 10px 18px rgba(225,81,72,0.28)",
    transform: "translateY(-1px)",
  },

  stack: {
    position: "absolute",
    left: "24px",
    right: "24px",
    bottom: "80px",
    margin: "0 auto",
  },

  folder: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "325px",
    borderRadius: "18px",
    boxShadow: "0 8px 0 rgba(255,255,255,0.12), 0 12px 18px rgba(0,0,0,0.15)",
    cursor: "pointer",
    userSelect: "none",
    transition: "transform 180ms ease, bottom 180ms ease, box-shadow 180ms ease",
    border: "8px solid rgba(255,255,255,0.55)",
    backgroundImage: "none",
    backgroundBlendMode: "normal",
  },

  tab: {
    position: "absolute",
    top: "-25px",
    height: "40px",
    width: "180px",
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
    fontSize: "1.2rem",
    fontWeight: 840,
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