from django.shortcuts import render
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Sum

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services import verificar_badges, definir_foco, atualizar_nivel

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

def obter_dados_perfil(crianca):
    # Recalcula pontos totais somando todas as partidas do histórico
    # Isso garante que inserções manuais no banco sejam contabilizadas corretamente
    total_pontos = PartidaJogo.objects.filter(crianca=crianca).aggregate(Sum('pontos'))['pontos__sum'] or 0
    if crianca.pontos_totais != total_pontos:
        crianca.pontos_totais = total_pontos
        crianca.save()

    # Sincroniza badges/conquistas com os pontos atuais (caso tenham sido alterados manualmente)
    verificar_badges(crianca)

    # Atualiza o nível baseado nos pontos
    atualizar_nivel(crianca)

    # Ordena pelo valor do badge (do menor para o maior) para pegarmos o "maior" ranking
    badges = CriancaBadge.objects.filter(crianca=crianca).order_by("badge__pontos_minimos")
    nomes_badges = [cb.badge.nome for cb in badges]

    # Lógica para identificar o Próximo Badge (Meta)
    proximo_badge_obj = Badge.objects.filter(pontos_minimos__gt=crianca.pontos_totais).order_by("pontos_minimos").first()
    proximo_badge = None
    if proximo_badge_obj:
        proximo_badge = {
            "nome": proximo_badge_obj.nome,
            "pontos": proximo_badge_obj.pontos_minimos
        }

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
        "email": crianca.usuario.email,
        "pontos_totais": crianca.pontos_totais,
        "nivel": crianca.nivel,
        "badges": nomes_badges,
        "proximo_badge": proximo_badge,
        "historico": historico
    })

@api_view(["GET"])
def perfil_unificado(request, identificador=None):
    # Se não veio na URL, tenta pegar dos parâmetros GET (?user=...)
    if not identificador:
        identificador = request.query_params.get("user")

    if not identificador:
        return Response({"erro": "Identificador não fornecido"}, status=400)
    
    user = None
    crianca = None

    # 1. Tentar achar o Usuário (User) pelo ID (se for número) ou pelo Nome
    if identificador.isdigit():
        try:
            user = User.objects.get(id=int(identificador))
        except User.DoesNotExist:
            pass
    
    if not user:
        try:
            user = User.objects.get(username__iexact=identificador)
        except User.DoesNotExist:
            return Response({"erro": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    # 2. Tentar achar ou criar a Criança (Perfil do Jogo)
    crianca, created = Crianca.objects.get_or_create(
        usuario=user,
        defaults={"nome": user.username}
    )
    
    return obter_dados_perfil(crianca)

@api_view(["POST"])
def atualizar_usuario(request):
    # Verifica se o usuário está logado
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
    novos_badges = verificar_badges(crianca)

    # atualiza nível
    atualizar_nivel(crianca)

    return Response({
        "msg": "Partida finalizada",
        "pontos_ganho": pontos,
        "pontos_totais": crianca.pontos_totais,
        "badges_novos": novos_badges
    })

@api_view(["GET"])
def ranking_global(request):
    page_number = request.query_params.get("page", 1)
    items_per_page = 10  # Quantidade de jogadores por página

    queryset = Crianca.objects.order_by("-pontos_totais")
    paginator = Paginator(queryset, items_per_page)
    page_obj = paginator.get_page(page_number)

    ranking = []
    start_index = (page_obj.number - 1) * paginator.per_page
    
    for i, c in enumerate(page_obj):
        # Pega o badge mais alto (maior pontos_minimos) para exibir na tabela
        top_badge = CriancaBadge.objects.filter(crianca=c).order_by("-badge__pontos_minimos").first()
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
