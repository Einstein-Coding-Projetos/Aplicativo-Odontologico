from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services import verificar_badges, definir_foco
from .models import (
    Crianca,
    PerfilEducacional,
    PartidaJogo,
    CriancaBadge,
    Premio,
    ProgressoPremio
)


# 🔎 Status do jogo
@api_view(["GET"])
def status_jogo(request, crianca_id):
    try:
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

    except Crianca.DoesNotExist:
        return Response(
            {"erro": "Criança não encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )


# 👤 Perfil da criança
@api_view(["GET"])
def perfil_crianca(request, crianca_id):
    try:
        crianca = Crianca.objects.get(id=crianca_id)

        # Histórico completo de badges (coleção real)
        badges = CriancaBadge.objects.filter(crianca=crianca)
        nomes_badges = [cb.badge.nome for cb in badges]

        # Contagem por tipo de badge
        contagem_badges = {}
        for nome in nomes_badges:
            contagem_badges[nome] = contagem_badges.get(nome, 0) + 1

        # Histórico de partidas
        partidas = PartidaJogo.objects.filter(
            crianca=crianca
        ).order_by("-criada_em")

        historico = [
            {
                "pontos": p.pontos,
                "data": p.criada_em.strftime("%d/%m/%Y")
            }
            for p in partidas
        ]

        # Progresso dos prêmios
        progressos = ProgressoPremio.objects.filter(crianca=crianca)
        progresso_premios = [
            {
                "premio": prog.premio.nome,
                "progresso": prog.quantidade_atual,
                "necessario": prog.premio.quantidade_necessaria
            }
            for prog in progressos
        ]

        return Response({
            "nome": crianca.nome,
            "pontos_totais": crianca.pontos_totais,
            "nivel": crianca.nivel,
            "badges": contagem_badges,
            "historico": historico,
            "progresso_premios": progresso_premios
        })

    except Crianca.DoesNotExist:
        return Response(
            {"erro": "Criança não encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )


# 🎮 Iniciar jogo
@api_view(["POST"])
def iniciar_jogo(request):
    try:
        crianca_id = request.data["crianca_id"]
        crianca = Crianca.objects.get(id=crianca_id)

        return Response({
            "msg": "Jogo iniciado",
            "crianca": crianca.nome
        })

    except Crianca.DoesNotExist:
        return Response(
            {"erro": "Criança não encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )


# 🏁 Finalizar partida
@api_view(["POST"])
def finalizar_partida(request):
    try:
        crianca_id = request.data["crianca_id"]
        pontos = int(request.data["pontos"])

        crianca = Crianca.objects.get(id=crianca_id)

        # Salva partida
        PartidaJogo.objects.create(
            crianca=crianca,
            pontos=pontos
        )

        # Atualiza pontos totais
        crianca.pontos_totais += pontos
        crianca.save()

        # 🔥 Badges baseadas APENAS na partida
        novos_badges = verificar_badges(crianca, pontos)

        return Response({
            "msg": "Partida finalizada",
            "pontos_ganho": pontos,
            "pontos_totais": crianca.pontos_totais,
            "badges_novos": novos_badges
        })

    except Crianca.DoesNotExist:
        return Response(
            {"erro": "Criança não encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )


# 🎁 Trocar prêmio
@api_view(["POST"])
def trocar_premio(request):
    try:
        crianca_id = request.data["crianca_id"]
        premio_id = request.data["premio_id"]

        crianca = Crianca.objects.get(id=crianca_id)
        premio = Premio.objects.get(id=premio_id)

        progresso, _ = ProgressoPremio.objects.get_or_create(
            crianca=crianca,
            premio=premio
        )

        if progresso.quantidade_atual >= premio.quantidade_necessaria:
            progresso.quantidade_atual = 0
            progresso.save()

            return Response({
                "msg": "Prêmio desbloqueado!",
                "premio": premio.nome
            })

        return Response(
            {"erro": "Não possui badges suficientes"},
            status=status.HTTP_400_BAD_REQUEST
        )

    except Crianca.DoesNotExist:
        return Response(
            {"erro": "Criança não encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )

    except Premio.DoesNotExist:
        return Response(
            {"erro": "Prêmio não encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )
