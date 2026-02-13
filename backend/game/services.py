from .models import Badge, CriancaBadge

from .models import Badge, CriancaBadge

def verificar_badges(crianca):
    badges_possiveis = Badge.objects.filter(
        pontos_minimos__lte=crianca.pontos_totais
    )

    novos_badges = []

    for badge in badges_possiveis:
        obj, created = CriancaBadge.objects.get_or_create(
            crianca=crianca,
            badge=badge
        )
        if created:
            novos_badges.append(badge.nome)

    return novos_badges


def definir_foco(perfil):
    if perfil.conhecimento_geral < 3:
        return "educativo"

    if not perfil.escova_noite:
        return "escovacao"

    if not perfil.usa_fio_dental:
        return "fio_dental"

    return "padrao"
