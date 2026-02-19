import { useState, useEffect } from "react";
import Germ from "./Germ";

export default function GermGameBoard({
  mouthOpen,
  mouthBox,
  jogoAtivo,
  onKill,
  spawnRate
}) {
  const [germes, setGermes] = useState([]);

  useEffect(() => {
    if (!jogoAtivo) return;

    const interval = setInterval(() => {
      if (mouthBox && mouthOpen) {
        spawnGerme();
      }
    }, spawnRate);

    return () => clearInterval(interval);
  }, [jogoAtivo, mouthBox, mouthOpen, spawnRate]);

  function spawnGerme() {
  if (!mouthBox) return;

  const tamanho = 30;
  const videoWidth = 640;

  const largura = mouthBox.right - mouthBox.left;
  const altura = mouthBox.bottom - mouthBox.top;

  if (largura <= tamanho || altura <= tamanho) return;

  const x =
    videoWidth -
    (Math.random() * (largura - tamanho) +
      mouthBox.left);

  const y =
    Math.random() * (altura - tamanho) +
    mouthBox.top;

  const novoGerme = {
    id: Date.now() + Math.random(),
    x,
    y,
  };

  setGermes((prev) => [...prev, novoGerme]);

  setTimeout(() => {
    setGermes((prev) =>
      prev.filter((g) => g.id !== novoGerme.id)
    );
  }, 2000);
}

  function matarGerme(id) {
    setGermes((prev) =>
      prev.filter((g) => g.id !== id)
    );
    if (onKill) onKill(10);
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
      {germes.map((germe) => (
        <Germ
          key={germe.id}
          germe={germe}
          onClick={() => matarGerme(germe.id)}
        />
      ))}
    </div>
  );

}