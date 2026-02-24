from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Sum
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services import verificar_badges, definir_foco, atualizar_nivel, verificar_personagens_disponiveis
from .models import (
    Crianca,
    PerfilEducacional,
    PartidaJogo,
    CriancaBadge,
    Premio,
    ProgressoPremio,
    Badge,
    CriancaPersonagem,
    Personagem,
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

    from .models import CriancaPersonagem

    personagem_ativo = CriancaPersonagem.objects.filter(
        crianca=crianca,
        ativo=True
    ).select_related("personagem").first()

    personagem_data = None

    if personagem_ativo:
        personagem_data = {
            "nome": personagem_ativo.personagem.nome,
            "asset_nome": personagem_ativo.personagem.asset_nome
        }

    return {
        "id": crianca.id,
        "nome": crianca.nome,
        "email": crianca.usuario.email,
        "pontos_totais": crianca.pontos_totais,
        "nivel": crianca.nivel,
        "badges": nomes_badges,
        "proximo_badge": proximo_badge,
        "historico": historico,
        "personagem_ativo": personagem_data,
    }


# 👤 Perfil unificado
@api_view(["GET"])
def perfil_unificado(request):
    if not request.user.is_authenticated:
        return Response({"erro": "Não autenticado"}, status=401)

    user = request.user

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
        dificuldade = request.data.get("dificuldade", "facil")

        crianca = Crianca.objects.get(id=crianca_id)

        PartidaJogo.objects.create(
            crianca=crianca,
            pontos=pontos,
            dificuldade=dificuldade
        )

        novos_badges = verificar_badges(crianca, pontos)
        atualizar_nivel(crianca)

        # Recalcula pontos totais para retorno atualizado
        total_pontos = PartidaJogo.objects.filter(crianca=crianca)\
            .aggregate(Sum('pontos'))['pontos__sum'] or 0

        if crianca.pontos_totais != total_pontos:
            crianca.pontos_totais = total_pontos
            crianca.save()

        total_pontos = PartidaJogo.objects.filter(crianca=crianca).aggregate(Sum('pontos'))['pontos__sum'] or 0

        personagens_disponiveis = verificar_personagens_disponiveis(crianca)
        print("PONTOS TOTAIS:", crianca.pontos_totais)
        
        # Busca o próximo badge para a barra de progresso
        proximo_badge_obj = Badge.objects.filter(
            pontos_minimos__gt=total_pontos
        ).order_by("pontos_minimos").first()

        proximo_badge_data = None
        if proximo_badge_obj:
            proximo_badge_data = {
                "nome": proximo_badge_obj.nome,
                "pontos": proximo_badge_obj.pontos_minimos
            }

        return Response({
            "msg": "Partida finalizada",
            "pontos_ganho": pontos,
            "badges_novos": novos_badges,
            "pontos_totais": total_pontos,
            "proximo_badge": proximo_badge_data,
            "personagens_disponiveis": [
                {
                    "id": p.id,
                        "nome": p.nome
                }
                for p in personagens_disponiveis
            ],
        })

    except Crianca.DoesNotExist:
        return Response({"erro": "Criança não encontrada"}, status=404)

@api_view(["POST"])
def desbloquear_personagem(request):
    try:
        crianca_id = request.data["crianca_id"]
        personagem_id = request.data["personagem_id"]

        crianca = Crianca.objects.get(id=crianca_id)
        personagem = Personagem.objects.get(id=personagem_id)

        # Verifica se já desbloqueou
        if CriancaPersonagem.objects.filter(
            crianca=crianca,
            personagem=personagem
        ).exists():
            return Response(
                {"erro": "Personagem já desbloqueado"},
                status=400
            )

        # Verifica se tem pontos suficientes
        if crianca.pontos_totais < personagem.pontos_necessarios:
            return Response(
                {"erro": "Pontos insuficientes"},
                status=400
            )

        CriancaPersonagem.objects.create(
            crianca=crianca,
            personagem=personagem,
            ativo=False
        )

        return Response({
            "msg": "Personagem desbloqueado com sucesso!"
        })

    except Crianca.DoesNotExist:
        return Response({"erro": "Criança não encontrada"}, status=404)

    except Personagem.DoesNotExist:
        return Response({"erro": "Personagem não encontrado"}, status=404)

@api_view(["GET"])
def listar_personagens(request, crianca_id):
    try:
        crianca = Crianca.objects.get(id=crianca_id)

        personagens = Personagem.objects.all().order_by("pontos_necessarios")

        personagens_desbloqueados = CriancaPersonagem.objects.filter(
            crianca=crianca
        )

        desbloqueados_ids = personagens_desbloqueados.values_list(
            "personagem_id", flat=True
        )

        personagem_ativo = personagens_desbloqueados.filter(
            ativo=True
        ).first()

        resultado = []

        for p in personagens:
            resultado.append({
                "id": p.id,
                "nome": p.nome,
                "asset_nome": p.asset_nome,
                "pontos_necessarios": p.pontos_necessarios,
                "desbloqueado": p.id in desbloqueados_ids,
                "ativo": personagem_ativo.personagem.id == p.id if personagem_ativo else False,
                "pode_desbloquear": (
                    crianca.pontos_totais >= p.pontos_necessarios
                    and p.id not in desbloqueados_ids
                )
            })

        return Response(resultado)

    except Crianca.DoesNotExist:
        return Response({"erro": "Criança não encontrada"}, status=404)
    
@api_view(["POST"])
def ativar_personagem(request):
    try:
        crianca_id = request.data["crianca_id"]
        personagem_id = request.data["personagem_id"]

        crianca = Crianca.objects.get(id=crianca_id)

        # Verifica se o personagem já foi desbloqueado
        if not CriancaPersonagem.objects.filter(
            crianca=crianca,
            personagem_id=personagem_id
        ).exists():
            return Response(
                {"erro": "Personagem não desbloqueado"},
                status=400
            )

        # Desativa todos
        CriancaPersonagem.objects.filter(
            crianca=crianca
        ).update(ativo=False)

        # Ativa o escolhido
        CriancaPersonagem.objects.filter(
            crianca=crianca,
            personagem_id=personagem_id
        ).update(ativo=True)

        return Response({"msg": "Personagem ativado com sucesso!"})

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