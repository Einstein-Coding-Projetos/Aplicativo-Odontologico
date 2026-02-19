import { useState, useEffect } from "react";
import { iniciarJogo, finalizarPartida } from "../api/game";
import GameContainer from "../components/game/GameContainer";

export default function Jogo() {
  const [criancaId] = useState(1);
  const [dificuldade, setDificuldade] = useState("facil");
  const [multiplicador, setMultiplicador] = useState(1);

  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [tempo, setTempo] = useState(30);
  const [pontos, setPontos] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (dificuldade === "facil") setMultiplicador(1);
    if (dificuldade === "intermediario") setMultiplicador(2);
    if (dificuldade === "dificil") setMultiplicador(3);
  }, [dificuldade]);

  useEffect(() => {
    if (!jogoIniciado) return;

    if (tempo <= 0) {
      encerrarJogo();
      return;
    }

    const timer = setTimeout(() => {
      setTempo((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [tempo, jogoIniciado]);

  async function iniciarPartida() {
    await iniciarJogo(criancaId);
    setJogoIniciado(true);
    setFinalizado(false);
    setTempo(30);
    setPontos(0);
  }

  async function encerrarJogo() {
    setJogoIniciado(false);
    setFinalizado(true);
    const response = await finalizarPartida(criancaId, pontos);
    setBadges(response.data.badges_novos);
  }

  const adicionarPontos = (valor) => {
    setPontos((prev) => prev + valor * multiplicador);
  };

  if (finalizado) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Partida Finalizada 🎉</h1>
        <p>Pontos: {pontos}</p>
        <button onClick={() => setFinalizado(false)}>Voltar</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>🦠 Jogo dos Germes</h1>

      {!jogoIniciado && (
        <>
          <select
            value={dificuldade}
            onChange={(e) => setDificuldade(e.target.value)}
          >
            <option value="facil">Fácil</option>
            <option value="intermediario">Intermediário</option>
            <option value="dificil">Difícil</option>
          </select>

          <br /><br />
          <button onClick={iniciarPartida}>Iniciar Jogo</button>
        </>
      )}

      <h3>Tempo: {tempo}s</h3>
      <h3>Pontos: {pontos}</h3>

      <GameContainer
        jogoAtivo={jogoIniciado}
        onKill={adicionarPontos}
      />
    </div>
  );
}