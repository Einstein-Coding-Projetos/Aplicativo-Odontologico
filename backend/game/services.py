from .models import Badge, CriancaBadge

from .models import Badge, CriancaBadge

from .models import ProgressoPremio, Premio

from .models import Badge, CriancaBadge, ProgressoPremio, Premio


def verificar_badges(crianca, pontos_partida):
    """
    A criança pode ganhar os mesmos badges várias vezes.
    Cada partida gera novos registros.
    """

    # Busca badges compatíveis com a pontuação da partida
    badges_ganhos = Badge.objects.filter(
        pontos_minimos__lte=pontos_partida
    )

    novos_badges = []

    for badge in badges_ganhos:
        # SEM verificar se já existe
        CriancaBadge.objects.create(
            crianca=crianca,
            badge=badge
        )

        novos_badges.append(badge.nome)

        # Atualiza progresso dos prêmios relacionados
        premios_relacionados = Premio.objects.filter(
            badge_requerida=badge
        )

        for premio in premios_relacionados:
            progresso, _ = ProgressoPremio.objects.get_or_create(
                crianca=crianca,
                premio=premio
            )

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
    PONTOS_POR_NIVEL = 100
    MAX_NIVEL = 10

    # Calcula o nível: a cada 100 pontos sobe 1. Começa no 1.
    novo_nivel = (crianca.pontos_totais // PONTOS_POR_NIVEL) + 1

    if novo_nivel > MAX_NIVEL:
        novo_nivel = MAX_NIVEL

    if crianca.nivel != novo_nivel:
        crianca.nivel = novo_nivel
        crianca.save()
