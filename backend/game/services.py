from django.db.models import Sum
from .models import Badge, CriancaBadge, ProgressoPremio, Premio, PartidaJogo


def verificar_badges(crianca, pontos_partida):
    """
    Verifica se a criança desbloqueou novos badges com base na pontuação total.
    Evita duplicatas.
    """
    
    # 1. Calcula o total de pontos acumulados (incluindo a partida atual)
    total_pontos = PartidaJogo.objects.filter(crianca=crianca).aggregate(Sum('pontos'))['pontos__sum'] or 0

    # 2. Busca todos os badges que a pontuação atual permite ter
    badges_possiveis = Badge.objects.filter(
        pontos_minimos__lte=total_pontos
    )

    # 3. Busca os IDs dos badges que a criança JÁ tem
    # Usamos set() para garantir busca rápida e única
    badges_ja_tem = set(CriancaBadge.objects.filter(crianca=crianca).values_list('badge_id', flat=True))

    novos_badges = []

    for badge in badges_possiveis:
        # 4. Só adiciona se a criança ainda NÃO tiver esse badge
        if badge.id not in badges_ja_tem:
            CriancaBadge.objects.create(
                crianca=crianca,
                badge=badge
            )
            novos_badges.append(badge.nome)

            # Atualiza progresso dos prêmios relacionados (opcional: manter lógica de prêmios)
            premios_relacionados = Premio.objects.filter(badge_requerida=badge)
            for premio in premios_relacionados:
                progresso, _ = ProgressoPremio.objects.get_or_create(crianca=crianca, premio=premio)
                progresso.quantidade_atual += 1
                progresso.save()

    return novos_badges


def definir_foco(perfil):
    if perfil.conhecimento_geral < 3:
        return "educativo"

    if not perfil.escova_noite:
        return "escovacao"

    if not perfil.usa_fio_dental:
        return "fio_dental"

    return "padrao"

def atualizar_nivel(crianca):
    PONTOS_POR_NIVEL = 2000
    MAX_NIVEL = 10

    # Calcula o nível: a cada 100 pontos sobe 1. Começa no 1.
    novo_nivel = (crianca.pontos_totais // PONTOS_POR_NIVEL) + 1

    if novo_nivel > MAX_NIVEL:
        novo_nivel = MAX_NIVEL

    if crianca.nivel != novo_nivel:
        crianca.nivel = novo_nivel
        crianca.save()
