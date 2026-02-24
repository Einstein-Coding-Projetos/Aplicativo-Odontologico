from django.urls import path
from .views import proxima_pergunta, responder_pergunta, resultado_mes_atual

urlpatterns = [
    path("proxima/<int:crianca_id>/", proxima_pergunta),
    path("responder/", responder_pergunta),
    path("resultado/<int:crianca_id>/", resultado_mes_atual),
]

