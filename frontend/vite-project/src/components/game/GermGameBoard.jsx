import { useState, useEffect, useRef } from "react";
import Germ from "./Germ";

export default function GermGameBoard({
  mouthOpen,
  mouthBox,
  jogoAtivo,
  onKill,
  spawnRate
}) {
  const [germe, setGerme] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!jogoAtivo) return;

    // Se boca estiver aberta e NÃO houver germe ativo
    if (mouthOpen && mouthBox && !germe) {
      spawnGerme();
    }

    // Se boca fechar, remove germe atual
    if (!mouthOpen) {
      limparGerme();
    }

    return () => clearTimeout(timeoutRef.current);
  }, [mouthOpen, jogoAtivo, mouthBox, germe]);

  function spawnGerme() {
    if (!mouthBox) return;

    const tamanho = 30;
    const videoWidth = 640;

    const largura = mouthBox.right - mouthBox.left;
    const altura = mouthBox.bottom - mouthBox.top;

    if (largura <= tamanho || altura <= tamanho) return;

    const x =
      videoWidth -
      (Math.random() * (largura - tamanho) + mouthBox.left);

    const y =
      Math.random() * (altura - tamanho) + mouthBox.top;

    const novoGerme = {
      id: Date.now(),
      x,
      y
    };

    setGerme(novoGerme);

    // Tempo que ele fica visível
    timeoutRef.current = setTimeout(() => {
      setGerme(null);
    }, spawnRate);
  }

  function limparGerme() {
    clearTimeout(timeoutRef.current);
    setGerme(null);
  }

  function matarGerme() {
    if (onKill) onKill(10);
    limparGerme();
  }

  return (
    <div
      style={{
        position: "absolute",
        width: "640px",
        height: "480px",
        pointerEvents: "auto",
        zIndex: 10,
      }}
    >
      {germe && (
        <Germ
          germe={germe}
          onClick={matarGerme}
        />
      )}
    </div>
  );
}