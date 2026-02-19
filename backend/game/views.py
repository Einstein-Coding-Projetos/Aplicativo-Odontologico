from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Sum
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services import verificar_badges, definir_foco, atualizar_nivel
from .models import (
    Crianca,
    PerfilEducacional,
    PartidaJogo,
    CriancaBadge,
    Premio,
    ProgressoPremio,
    Badge
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


# 🔄 Atualiza dados automaticamente
def obter_dados_perfil(crianca):
    total_pontos = PartidaJogo.objects.filter(crianca=crianca)\
        .aggregate(Sum('pontos'))['pontos__sum'] or 0

    if crianca.pontos_totais != total_pontos:
        crianca.pontos_totais = total_pontos
        crianca.save()

    verificar_badges(crianca)
    atualizar_nivel(crianca)

    badges = CriancaBadge.objects.filter(crianca=crianca)\
        .order_by("badge__pontos_minimos")

    nomes_badges = [cb.badge.nome for cb in badges]

    proximo_badge_obj = Badge.objects.filter(
        pontos_minimos__gt=crianca.pontos_totais
    ).order_by("pontos_minimos").first()

    proximo_badge = None
    if proximo_badge_obj:
        proximo_badge = {
            "nome": proximo_badge_obj.nome,
            "pontos": proximo_badge_obj.pontos_minimos
        }

    partidas = PartidaJogo.objects.filter(crianca=crianca)\
        .order_by("-criada_em")

    historico = [
        {
            "pontos": p.pontos,
            "data": p.criada_em.strftime("%d/%m/%Y")
        }
        for p in partidas
    ]

    return {
        "nome": crianca.nome,
        "email": crianca.usuario.email,
        "pontos_totais": crianca.pontos_totais,
        "nivel": crianca.nivel,
        "badges": nomes_badges,
        "proximo_badge": proximo_badge,
        "historico": historico
    }


# 👤 Perfil unificado
@api_view(["GET"])
def perfil_unificado(request):
    identificador = request.query_params.get("user")

    if not identificador:
        return Response({"erro": "Identificador não fornecido"}, status=400)

    user = None

    if identificador.isdigit():
        user = User.objects.filter(id=int(identificador)).first()

    if not user:
        user = User.objects.filter(username__iexact=identificador).first()

    if not user:
        return Response({"erro": "Usuário não encontrado"}, status=404)

    crianca, _ = Crianca.objects.get_or_create(
        usuario=user,
        defaults={"nome": user.username}
    )

    return Response(obter_dados_perfil(crianca))


# 👤 Perfil tradicional
@api_view(["GET"])
def perfil_crianca(request, crianca_id):
    try:
        crianca = Crianca.objects.get(id=crianca_id)
        dados = obter_dados_perfil(crianca)

        progressos = ProgressoPremio.objects.filter(crianca=crianca)
        progresso_premios = [
            {
                "premio": prog.premio.nome,
                "progresso": prog.quantidade_atual,
                "necessario": prog.premio.quantidade_necessaria
            }
            for prog in progressos
        ]

        dados["progresso_premios"] = progresso_premios

        return Response(dados)

    except Crianca.DoesNotExist:
        return Response({"erro": "Criança não encontrada"}, status=404)


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
        return Response({"erro": "Criança não encontrada"}, status=404)


# 🏁 Finalizar partida
@api_view(["POST"])
def finalizar_partida(request):
    try:
        crianca_id = request.data["crianca_id"]
        pontos = int(request.data["pontos"])

        crianca = Crianca.objects.get(id=crianca_id)

        PartidaJogo.objects.create(
            crianca=crianca,
            pontos=pontos
        )

        crianca.pontos_totais += pontos
        crianca.save()

        novos_badges = verificar_badges(crianca)
        atualizar_nivel(crianca)

        return Response({
            "msg": "Partida finalizada",
            "pontos_ganho": pontos,
            "pontos_totais": crianca.pontos_totais,
            "badges_novos": novos_badges
        })

    except Crianca.DoesNotExist:
        return Response({"erro": "Criança não encontrada"}, status=404)


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
            status=400
        )

    except Crianca.DoesNotExist:
        return Response({"erro": "Criança não encontrada"}, status=404)

    except Premio.DoesNotExist:
        return Response({"erro": "Prêmio não encontrado"}, status=404)


# 🏆 Ranking global
@api_view(["GET"])
def ranking_global(request):
    page_number = request.query_params.get("page", 1)
    items_per_page = 10

    queryset = Crianca.objects.order_by("-pontos_totais")
    paginator = Paginator(queryset, items_per_page)
    page_obj = paginator.get_page(page_number)

    ranking = []
    start_index = (page_obj.number - 1) * paginator.per_page

    for i, c in enumerate(page_obj):
        top_badge = CriancaBadge.objects.filter(
            crianca=c
        ).order_by("-badge__pontos_minimos").first()

        badge_nome = top_badge.badge.nome if top_badge else "Escovador Iniciante"

        ranking.append({
            "posicao": start_index + i + 1,
            "nome": c.nome,
            "pontos": c.pontos_totais,
            "nivel": c.nivel,
            "badge": badge_nome
        })

    return Response({
        "results": ranking,
        "num_pages": paginator.num_pages,
        "current_page": page_obj.number
    })


# 🔐 Atualizar usuário
@api_view(["POST"])
def atualizar_usuario(request):
    if not request.user.is_authenticated:
        return Response({"erro": "Não autenticado"}, status=401)

    user = request.user
    novo_email = request.data.get("email")
    nova_senha = request.data.get("senha")

    if novo_email:
        user.email = novo_email

    if nova_senha:
        user.set_password(nova_senha)

    user.save()

    return Response({"msg": "Dados atualizados com sucesso!"})