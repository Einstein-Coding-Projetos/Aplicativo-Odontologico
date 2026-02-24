from django.contrib import admin
from .models import Pergunta, Alternativa, Resposta

class AlternativaInline(admin.TabularInline):
    model = Alternativa
    extra = 4 # quatro linhas de alternativa

@admin.register(Pergunta)
class PerguntaAdmin(admin.ModelAdmin):
    inlines = [AlternativaInline]
    list_display = ("id", "texto")
    
admin.site.register(Resposta)