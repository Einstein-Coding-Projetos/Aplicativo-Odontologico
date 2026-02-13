import api from "./axios";

export function iniciarJogo(criancaId) {
  return api.post("game/iniciar/", {
    crianca_id: criancaId,
  });
}

export function finalizarPartida(criancaId, pontos) {
  return api.post("game/finalizar/", {
    crianca_id: criancaId,
    pontos: pontos,
  });
}

export function statusJogo(criancaId) {
  return api.get(`game/status/${criancaId}/`);
}
