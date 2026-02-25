import { useNavigate } from "react-router-dom";
import { useState } from "react"; // Importando useState para controlar o hover
import reinoImg from "../assets/reino.png"; // Imagem do Reino
import monstrosCarie from "../assets/monstros_carie.png"; // Imagem dos monstros
import denteDoce from "../assets/dente_doce.png"; // Imagem do dente doce

function Home() {
  const navigate = useNavigate();

  // Definindo o estado para controlar o hover
  const [hovered, setHovered] = useState({
    jogo: false,
    questionario: false,
    perfil: false,
    ranking: false,
    personagens: false,
  });

  return (
    <div style={styles.container}>
      {/* Slideshow com imagens lado a lado */}
      <div style={styles.imageContainer}>
        <div style={styles.imageWrapper}>
          <img
            src={monstrosCarie} // Imagem dos Monstros
            alt="Monstros Carie"
            style={styles.image}
          />
          <div
            style={hovered.jogo ? { ...styles.linkBoxImage1, backgroundColor: "#E15148" } : styles.linkBoxImage1}
            onClick={() => navigate("/jogo")}
            onMouseEnter={() => setHovered({ ...hovered, jogo: true })}
            onMouseLeave={() => setHovered({ ...hovered, jogo: false })}
          >
            Jogo dos Germes
          </div>
        </div>
        <div style={styles.imageWrapper}>
          <img
            src={reinoImg} // Imagem do Reino
            alt="Reino dos Dentes"
            style={styles.image}
          />
          <div
            style={hovered.questionario ? { ...styles.linkBoxImage2, backgroundColor: "#E15148" } : styles.linkBoxImage2}
            onClick={() => navigate("/questionario")}
            onMouseEnter={() => setHovered({ ...hovered, questionario: true })}
            onMouseLeave={() => setHovered({ ...hovered, questionario: false })}
          >
            Questionário
          </div>
        </div>
        <div style={styles.imageWrapper}>
          <img
            src={denteDoce} // Imagem do Dente Doce
            alt="Dente Doce"
            style={styles.image}
          />
          <div
            style={hovered.perfil ? { ...styles.linkBoxImage3, backgroundColor: "#E15148" } : styles.linkBoxImage3}
            onClick={() => navigate("/perfil")}
            onMouseEnter={() => setHovered({ ...hovered, perfil: true })}
            onMouseLeave={() => setHovered({ ...hovered, perfil: false })}
          >
            Perfil
          </div>
        </div>
      </div>

      {/* Adicionando os novos links: Ranking e Personagens */}
      <div style={styles.linksContainer}>
        <div
          style={hovered.ranking ? { ...styles.linkBox, backgroundColor: "#E15148" } : styles.linkBox}
          onClick={() => navigate("/ranking")}
          onMouseEnter={() => setHovered({ ...hovered, ranking: true })}
          onMouseLeave={() => setHovered({ ...hovered, ranking: false })}
        >
          Ranking
        </div>
        <div
          style={hovered.personagens ? { ...styles.linkBox, backgroundColor: "#E15148" } : styles.linkBox}
          onClick={() => navigate("/personagens")}
          onMouseEnter={() => setHovered({ ...hovered, personagens: true })}
          onMouseLeave={() => setHovered({ ...hovered, personagens: false })}
        >
          Personagens
        </div>
      </div>

      {/* Menu Principal */}
      <h1 style={styles.title}>Menu Principal</h1>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(to bottom, #4facfe, #00f2fe)", // Degradê de fundo
    minHeight: "100vh", // Garantir que a altura seja 100% da tela
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center", // Para centralizar o conteúdo
    fontFamily: "'Nunito', sans-serif", // Fonte usada na página
    color: "#fff", // Cor do texto
    padding: "20px",
    position: "relative", // Necessário para o título ficar posicionado corretamente
  },
  imageContainer: {
    display: "flex", // Faz com que as imagens fiquem lado a lado
    gap: "20px", // Espaço entre as imagens
    width: "100%", // Garante que ocupe toda a largura disponível
    marginBottom: "20px", // Espaço entre a imagem e o menu
    textAlign: "center", // Centraliza as imagens
    overflow: "hidden", // Garante que as imagens não saiam da área
    position: "relative", // Necessário para posicionamento dos links
  },
  imageWrapper: {
    position: "relative", // Necessário para posicionar os links sobre as imagens
    width: "30%", // Cada imagem ocupa 30% da largura
  },
  image: {
    width: "100%", // Garantir que a imagem ocupe todo o espaço
    height: "auto", // Mantém a proporção da imagem
    borderRadius: "8px", // Bordas arredondadas
    border: "5px solid #fff", // Borda branca mais destacada
    boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)", // Sombra bonita para a imagem
    opacity: 0.6, // Adicionando opacidade para tornar as imagens mais transparentes
  },
  linkBoxImage1: {
    position: "absolute", // Posiciona o link sobre a imagem
    top: "50%", // Coloca o link no meio da imagem
    left: "50%",
    transform: "translate(-50%, -50%)", // Para garantir que o link esteja centrado
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Fundo semitransparente
    padding: "10px 20px", // Tamanho do link
    fontSize: "1.8rem", // Aumentando o tamanho da fonte
    fontWeight: "700", // Negrito no texto
    borderRadius: "25px", // Bordas arredondadas
    cursor: "pointer",
    textAlign: "center",
    width: "auto", // Largura ajustável
    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)", // Adicionando sombra ao texto
    transition: "background-color 0.3s, color 0.3s", // Transição para a cor de fundo ao passar o mouse
  },
  linkBoxImage2: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: "10px 20px",
    fontSize: "1.8rem", // Aumentando o tamanho da fonte
    fontWeight: "700",
    borderRadius: "25px",
    cursor: "pointer",
    textAlign: "center",
    width: "auto",
    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)", // Adicionando sombra ao texto
    transition: "background-color 0.3s, color 0.3s", // Transição para a cor de fundo ao passar o mouse
  },
  linkBoxImage3: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: "10px 20px",
    fontSize: "1.8rem", // Aumentando o tamanho da fonte
    fontWeight: "700",
    borderRadius: "25px",
    cursor: "pointer",
    textAlign: "center",
    width: "auto",
    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)", // Adicionando sombra ao texto
    transition: "background-color 0.3s, color 0.3s", // Transição para a cor de fundo ao passar o mouse
  },

  // Efeito hover para Ranking e Personagens
  linkBox: {
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Fundo semitransparente
    padding: "10px 20px", // Tamanho do link
    fontSize: "1.8rem", // Aumentando o tamanho da fonte
    fontWeight: "700",
    borderRadius: "25px", // Bordas arredondadas
    cursor: "pointer",
    textAlign: "center",
    width: "auto",
    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)",
    transition: "background-color 0.3s, color 0.3s",
  },
  linksContainer: {
    display: "flex",
    gap: "30px", // Espaço entre os links
    marginTop: "20px", // Espaço acima dos links
  },

  title: {
    position: "absolute",
    top: "40px", // Coloca o título mais perto do topo
    left: "40px", // Coloca o título mais à esquerda
    fontSize: "4rem", // Tamanho grande para o título
    fontWeight: "800", // Título em negrito
    color: "#fff", // Cor do título
    zIndex: 10, // Garante que o título esteja acima de outros elementos
    fontFamily: "'Nunito', sans-serif", // Adicionando a fonte ao título
  },
};

export default Home;