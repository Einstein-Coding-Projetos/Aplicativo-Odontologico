from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services import verificar_badges, definir_foco

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Crianca,
    PerfilEducacional,
    PartidaJogo,
    Badge,
    CriancaBadge
)


@api_view(['GET'])
def status_jogo(request, crianca_id):
    crianca = Crianca.objects.get(id=crianca_id)

    try:
        perfil = PerfilEducacional.objects.get(crianca=crianca)
        foco = definir_foco(perfil)
    except PerfilEducacional.DoesNotExist:
        foco = "padrao"

    return Response({
        "liberado": True,
        "foco": foco,
        "pontos_totais": crianca.pontos_totais
    })

@api_view(["GET"])
def perfil_crianca(request, crianca_id):
    try:
        crianca = Crianca.objects.get(id=crianca_id)

        badges = CriancaBadge.objects.filter(crianca=crianca)
        nomes_badges = [cb.badge.nome for cb in badges]

        partidas = PartidaJogo.objects.filter(crianca=crianca).order_by("-criada_em")
        historico = [
            {
                "pontos": p.pontos,
                "data": p.criada_em.strftime("%d/%m/%Y")
            }
            for p in partidas
        ]

        return Response({
            "nome": crianca.nome,
            "pontos_totais": crianca.pontos_totais,
            "nivel": crianca.nivel,
            "badges": nomes_badges,
            "historico": historico
        })

    except Crianca.DoesNotExist:
        return Response(
            {"erro": "Criança não encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )


# 1️⃣ Iniciar jogo
@api_view(["POST"])
def iniciar_jogo(request):
    crianca_id = request.data["crianca_id"]

    crianca = Crianca.objects.get(id=crianca_id)

    return Response({
        "msg": "Jogo iniciado",
        "crianca": crianca.nome
    })


# 2️⃣ Finalizar jogo
@api_view(["POST"])
def finalizar_partida(request):
    crianca_id = request.data["crianca_id"]
    pontos = int(request.data["pontos"])

    crianca = Crianca.objects.get(id=crianca_id)

    # salva partida
    PartidaJogo.objects.create(
        crianca=crianca,
        pontos=pontos
    )

    # soma pontos totais
    crianca.pontos_totais += pontos
    crianca.save()

    # libera badges
    badges = Badge.objects.filter(pontos_minimos__lte=crianca.pontos_totais)
    novos_badges = verificar_badges(crianca)

    for badge in badges:
        obj, created = CriancaBadge.objects.get_or_create(
            crianca=crianca,
            badge=badge
        )
        if created:
            novos_badges.append(badge.nome)

    return Response({
        "msg": "Partida finalizada",
        "pontos_ganho": pontos,
        "pontos_totais": crianca.pontos_totais,
        "badges_novos": novos_badges
    })
