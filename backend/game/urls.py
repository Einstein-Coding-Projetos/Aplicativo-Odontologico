from django.urls import path
from .views import (
    status_jogo,
    iniciar_jogo,
    finalizar_partida,
    perfil_crianca,
    trocar_premio,
    perfil_unificado,
    ranking_global,
    atualizar_usuario,
    desbloquear_personagem,
    listar_personagens,
    ativar_personagem,
)

urlpatterns = [
    path("status/<int:crianca_id>/", status_jogo, name="status_jogo"),
    path("iniciar/", iniciar_jogo, name="iniciar_jogo"),
    path("finalizar/", finalizar_partida, name="finalizar_partida"),

    path("perfil/<int:crianca_id>/", perfil_crianca, name="perfil_crianca"),
    path("trocar-premio/", trocar_premio, name="trocar_premio"),

    path("ranking/", ranking_global, name="ranking_global"),
    path("obter-perfil/", perfil_unificado, name="obter_perfil"),
    path("atualizar-usuario/", atualizar_usuario, name="atualizar_usuario"),

    path("desbloquear-personagem/", desbloquear_personagem),
    path("personagens/<int:crianca_id>/", listar_personagens),
    path("ativar_personagem/", ativar_personagem),
]