import api from "./axios";

export function listarPerguntas() {
  return api.get("questions/");
}

export function responderPergunta(criancaId, perguntaId, resposta) {
  return api.post("questions/responder", {
    crianca_id: criancaId,
    pergunta_id: perguntaId,
    resposta: resposta,
  });
}
