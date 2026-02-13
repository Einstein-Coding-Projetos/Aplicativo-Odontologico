from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import Pergunta, Resposta

@admin.register(Pergunta)
class PerguntaAdmin(admin.ModelAdmin):
    list_display = ("id", "texto")
    search_fields = ("texto",)


@admin.register(Resposta)
class RespostaAdmin(admin.ModelAdmin):
    list_display = ("id", "crianca", "pergunta", "data")
    list_filter = ("data",)
