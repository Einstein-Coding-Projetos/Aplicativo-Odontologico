from django.urls import path
from .views import proxima_pergunta, responder_pergunta

urlpatterns = [
    path("proxima/<int:crianca_id>/", proxima_pergunta),
    path("responder/", responder_pergunta),
]

