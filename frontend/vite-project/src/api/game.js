import api from "./axios";

export function iniciarJogo(criancaId) {
  return api.post("game/iniciar/", {
    crianca_id: criancaId,
  });
}

export function finalizarPartida(criancaId, pontos, dificuldade) {
  return api.post("game/finalizar/", {
    crianca_id: criancaId,
    pontos: pontos,
    dificuldade: dificuldade,
  });
}

export function statusJogo(criancaId) {
  return api.get(`game/status/${criancaId}/`);
}
