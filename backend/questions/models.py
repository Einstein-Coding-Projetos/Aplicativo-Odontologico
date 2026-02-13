from django.db import models

# Create your models here.

from django.db import models
from game.models import Crianca

class Pergunta(models.Model):
    texto = models.CharField(max_length=255)

    def __str__(self):
        return self.texto


class Resposta(models.Model):
    crianca = models.ForeignKey(Crianca, on_delete=models.CASCADE)
    pergunta = models.ForeignKey(Pergunta, on_delete=models.CASCADE)
    resposta = models.CharField(max_length=255)
    data = models.DateTimeField(auto_now_add=True)
