import WebcamView from "./WebcamView";
import GermGameBoard from "./GermGameBoard.jsx";
import useMouthDetection from "../../hooks/useMouthDetection";

export default function GameContainer({ jogoAtivo, onKill, spawnRate }) {
  const { mouthOpen, mouthBox, detect } = useMouthDetection();

  return (
    <div
      style={{
        position: "relative",
        width: 640,
        height: 480,
        margin: "0 auto"
      }}
    >
      {jogoAtivo && (
        <WebcamView onFrame={detect} />
      )}

      {jogoAtivo && (
        <GermGameBoard
          mouthOpen={mouthOpen}
          mouthBox={mouthBox}
          jogoAtivo={jogoAtivo}
          onKill={onKill}
          spawnRate={spawnRate}
        />
      )}
    </div>
  );
}