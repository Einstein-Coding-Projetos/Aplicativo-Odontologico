# Register your models here.

from django.contrib import admin
from .models import (
    Crianca,
    PerfilEducacional,
    PartidaJogo,
    Badge,
    CriancaBadge,
    Personagem,
    CriancaPersonagem
)

admin.site.register(Crianca)
admin.site.register(PerfilEducacional)
admin.site.register(PartidaJogo)
admin.site.register(Badge)
admin.site.register(CriancaBadge)


@admin.register(Personagem)
class PersonagemAdmin(admin.ModelAdmin):
    list_display = ("nome", "pontos_necessarios")


@admin.register(CriancaPersonagem)
class CriancaPersonagemAdmin(admin.ModelAdmin):
    list_display = ("crianca", "personagem", "ativo", "data_desbloqueio")
