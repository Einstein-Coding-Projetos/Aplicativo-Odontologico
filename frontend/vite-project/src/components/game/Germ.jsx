// Componente simples de um germe:

//Recebe posição

//Recebe função de matar

//Pode ter animação

import germ1 from "../../assets/germs/germ_transparente_1.png";
import germ2 from "../../assets/germs/germ_transparente_2.png";


const imagens = [germ1, germ2];

export default function Germ({ germe, onClick }) {
  const imagem =
    imagens[Math.floor(Math.random() * imagens.length)];

  return (
    <img
      src={imagem}
      alt="germe"
      onClick={onClick}
      style={{
        position: "absolute",
        left: germe.x,
        top: germe.y,
        width: "50px",
        cursor: "pointer",
        pointerEvents: "auto"
      }}
    />
  );
}

