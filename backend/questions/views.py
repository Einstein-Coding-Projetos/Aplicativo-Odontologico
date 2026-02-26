from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from .models import Pergunta, Resposta, Alternativa, Tentativa
from game.models import Crianca
from django.utils import timezone


@api_view(["GET"])
@permission_classes([AllowAny])
def proxima_pergunta(request, crianca_id):
    agora = timezone.localtime(timezone.now())
    ano, mes = agora.year, agora.month

    crianca = Crianca.objects.get(id=crianca_id)

    tentativa, _ = Tentativa.objects.get_or_create(
        crianca=crianca,
        ano=ano,
        mes=mes,
        defaults={"finalizado": False}
    )

    if tentativa.finalizado:
        return Response({
            "finalizado": True,
            "score": tentativa.score_total,
            "resultado": tentativa.resultado,
            "msg": "Questionário do mês já finalizado"
        })

    respondidas = Resposta.objects.filter(
        tentativa=tentativa
    ).values_list("pergunta_id", flat=True)

    pergunta = Pergunta.objects.exclude(
        id__in=respondidas
    ).prefetch_related("alternativas").first()

    if not pergunta: #calcula score e salva na tentativa
        score = 0
        for r in Resposta.objects.filter(tentativa=tentativa).select_related("alternativa"):
            if r.alternativa_id is not None:
                score += (r.alternativa.pontos or 0)

        tentativa.score_total = score
        
        tentativa.resultado = "UAU" if score >= 9 else "CUIDADO"
        tentativa.finalizado = True
        tentativa.save(update_fields=["score_total", "resultado", "finalizado"])

        return Response({
            "finalizado": True,
            "score": tentativa.score_total,
            "resultado": tentativa.resultado,
            "msg": "Questionário finalizado"
        })

    alternativas = [
        {
            "id": alt.id,
            "texto": alt.texto,
            "ordem": alt.ordem
        }
        for alt in pergunta.alternativas.all().order_by("ordem")
    ]

    return Response({
        "finalizado": False,
        "tentativa": {"ano": ano, "mes": mes},
        "pergunta": {
            "id": pergunta.id,
            "texto": pergunta.texto,
            "alternativas": alternativas
        }
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def responder_pergunta(request):
    crianca_id = request.data.get("crianca_id")
    pergunta_id = request.data.get("pergunta_id")
    alternativa_id = request.data.get("alternativa_id")

    if not all([crianca_id, pergunta_id, alternativa_id]):
        return Response({"erro": "Dados incompletos"}, status=400)
    
    agora = timezone.localtime(timezone.now())
    ano, mes = agora.year, agora.month

    crianca = Crianca.objects.get(id=crianca_id)
    tentativa, _ = Tentativa.objects.get_or_create(crianca=crianca, ano=ano, mes=mes)

    if tentativa.finalizado:
        return Response({"erro": "Questionário do mês já finalizado"}, status=403)

    pergunta = Pergunta.objects.get(id=pergunta_id)
    alternativa = Alternativa.objects.get(id=alternativa_id, pergunta=pergunta)

    Resposta.objects.update_or_create(
        tentativa=tentativa,
        pergunta=pergunta,
        defaults={"alternativa": alternativa}
    )

    score = 0
    for r in Resposta.objects.filter(tentativa=tentativa).select_related("alternativa"):
        if r.alternativa_id is not None:
            score += (r.alternativa.pontos or 0)
    return Response({
        "msg": "Resposta salva",
        "score_parcial": score,
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def resultado_questionario(request, crianca_id):
    agora = timezone.localtime(timezone.now())
    ano, mes = agora.year, agora.month

    crianca = Crianca.objects.get(id=crianca_id)
    tentativa = Tentativa.objects.filter(crianca=crianca, ano=ano, mes=mes).first()

    if not tentativa:
        return Response({"erro": "Ainda não existe tentativa neste mês"}, status=404)

    return Response({
        "crianca_id": crianca.id,
        "ano":ano,
        "mes":mes,
        "finalizado": tentativa.finalizado,
        "score": tentativa.score_total,
        "resultado": tentativa.resultado
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def resultado_mes_atual(request, crianca_id):
    # Reaproveita a mesma lógica do resultado do mês atual
    return resultado_questionario(request, crianca_id)