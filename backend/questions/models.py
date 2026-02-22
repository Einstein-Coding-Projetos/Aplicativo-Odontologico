from django.db import models
from game.models import Crianca


class Pergunta(models.Model):
    texto = models.CharField(max_length=255)

    def __str__(self):
        return self.texto


class Alternativa(models.Model):
    pergunta = models.ForeignKey(
        Pergunta,
        related_name="alternativas",
        on_delete=models.CASCADE
    )
    texto = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.pergunta.texto} - {self.texto}"


class Resposta(models.Model):
    crianca = models.ForeignKey(Crianca, on_delete=models.CASCADE)
    pergunta = models.ForeignKey(Pergunta, on_delete=models.CASCADE)
    alternativa = models.ForeignKey(Alternativa, on_delete=models.CASCADE, null=True, blank=True)
    data = models.DateTimeField(auto_now_add=True)