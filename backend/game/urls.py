from django.urls import path
from .views import status_jogo, iniciar_jogo, finalizar_partida, perfil_unificado, ranking_global, atualizar_usuario

urlpatterns = [
    path("status/<int:crianca_id>/", status_jogo, name="status_jogo"),
    path("iniciar/", iniciar_jogo, name="iniciar_jogo"),
    path("finalizar/", finalizar_partida, name="finalizar_partida"),
    path("ranking/", ranking_global, name="ranking_global"),
    path("obter-perfil/", perfil_unificado, name="obter_perfil"),
    path("atualizar-usuario/", atualizar_usuario, name="atualizar_usuario"),
]