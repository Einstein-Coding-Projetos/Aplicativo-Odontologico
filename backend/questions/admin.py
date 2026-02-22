from django.contrib import admin
from .models import Pergunta, Alternativa

class AlternativaInline(admin.TabularInline):
    model = Alternativa
    extra = 2

@admin.register(Pergunta)
class PerguntaAdmin(admin.ModelAdmin):
    inlines = [AlternativaInline]