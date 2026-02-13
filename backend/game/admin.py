# Register your models here.

from django.contrib import admin
from .models import (
    Crianca,
    PerfilEducacional,
    PartidaJogo,
    Badge,
    CriancaBadge
)

admin.site.register(Crianca)
admin.site.register(PerfilEducacional)
admin.site.register(PartidaJogo)
admin.site.register(Badge)
admin.site.register(CriancaBadge)
