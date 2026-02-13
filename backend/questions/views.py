from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Pergunta, Resposta
from game.models import Crianca

PONTOS_POR_PERGUNTA = 10


@api_view(["GET"])
def proxima_pergunta(request, crianca_id):
    """
    Retorna a próxima pergunta que a criança ainda não respondeu
    """

    # perguntas já respondidas pela criança
    respondidas = Resposta.objects.filter(
        crianca_id=crianca_id
    ).values_list("pergunta_id", flat=True)

    # próxima pergunta não respondida
    pergunta = Pergunta.objects.exclude(
        id__in=respondidas
    ).first()

    if not pergunta:
        return Response({
            "finalizado": True,
            "msg": "Questionário finalizado"
        })

    return Response({
        "finalizado": False,
        "pergunta": {
            "id": pergunta.id,
            "texto": pergunta.texto
        }
    })


@api_view(["POST"])
def responder_pergunta(request):
    crianca_id = request.data.get("crianca_id")
    pergunta_id = request.data.get("pergunta_id")
    resposta_texto = request.data.get("resposta")

    if not all([crianca_id, pergunta_id, resposta_texto]):
        return Response(
            {"erro": "Dados incompletos"},
            status=400
        )

    crianca = Crianca.objects.get(id=crianca_id)
    pergunta = Pergunta.objects.get(id=pergunta_id)

    # evita responder a mesma pergunta duas vezes
    if Resposta.objects.filter(
        crianca=crianca,
        pergunta=pergunta
    ).exists():
        return Response(
            {"erro": "Pergunta já respondida"},
            status=400
        )

    # salva resposta
    Resposta.objects.create(
        crianca=crianca,
        pergunta=pergunta,
        resposta=resposta_texto
    )

    # soma pontos
    crianca.pontos_totais += PONTOS_POR_PERGUNTA
    crianca.save()

    return Response({
        "msg": "Resposta salva",
        "pontos_totais": crianca.pontos_totais
    })
