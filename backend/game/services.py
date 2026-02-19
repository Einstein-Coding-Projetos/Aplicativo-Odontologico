from .models import Badge, CriancaBadge

from .models import Badge, CriancaBadge

from .models import ProgressoPremio, Premio

def verificar_badges(crianca, pontos_partida):
    badges_possiveis = Badge.objects.filter(
        pontos_minimos__lte=pontos_partida
    )

    novos_badges = []

    for badge in badges_possiveis:
        # salva histórico
        CriancaBadge.objects.create(
            crianca=crianca,
            badge=badge
        )

        novos_badges.append(badge.nome)

        # atualiza progresso dos prêmios relacionados
        premios_relacionados = Premio.objects.filter(badge_requerida=badge)

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
