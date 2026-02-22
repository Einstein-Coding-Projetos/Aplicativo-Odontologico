from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Pergunta, Resposta, Alternativa
from game.models import Crianca

PONTOS_POR_PERGUNTA = 10


@api_view(["GET"])
def proxima_pergunta(request, crianca_id):

    respondidas = Resposta.objects.filter(
        crianca_id=crianca_id
    ).values_list("pergunta_id", flat=True)

    pergunta = Pergunta.objects.exclude(
        id__in=respondidas
    ).prefetch_related("alternativas").first()

    if not pergunta:
        return Response({
            "finalizado": True,
            "msg": "Questionário finalizado"
        })

    alternativas = [
        {
            "id": alt.id,
            "texto": alt.texto
        }
        for alt in pergunta.alternativas.all()
    ]

    return Response({
        "finalizado": False,
        "pergunta": {
            "id": pergunta.id,
            "texto": pergunta.texto,
            "alternativas": alternativas
        }
    })


@api_view(["POST"])
def responder_pergunta(request):
    crianca_id = request.data.get("crianca_id")
    pergunta_id = request.data.get("pergunta_id")
    alternativa_id = request.data.get("alternativa_id")

    if not all([crianca_id, pergunta_id, alternativa_id]):
        return Response({"erro": "Dados incompletos"}, status=400)

    crianca = Crianca.objects.get(id=crianca_id)
    pergunta = Pergunta.objects.get(id=pergunta_id)
    alternativa = Alternativa.objects.get(id=alternativa_id)

    if Resposta.objects.filter(
        crianca=crianca,
        pergunta=pergunta
    ).exists():
        return Response({"erro": "Pergunta já respondida"}, status=400)

    Resposta.objects.create(
        crianca=crianca,
        pergunta=pergunta,
        alternativa=alternativa
    )

    crianca.pontos_totais += PONTOS_POR_PERGUNTA
    crianca.save()

    return Response({
        "msg": "Resposta salva",
        "pontos_totais": crianca.pontos_totais
    })