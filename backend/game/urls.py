from django.urls import path
from .views import status_jogo, iniciar_jogo, finalizar_partida, perfil_crianca, trocar_premio

urlpatterns = [
    path("status/<int:crianca_id>/", status_jogo),
    path("iniciar/", iniciar_jogo),
    path("finalizar/", finalizar_partida),
    path("perfil/<int:crianca_id>/", perfil_crianca),
    path("trocar-premio/", trocar_premio),

]
