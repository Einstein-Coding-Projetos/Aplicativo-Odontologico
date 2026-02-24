from django.db import models
from game.models import Crianca
from game.models import Crianca

class TentativaMensal(models.Model):
    crianca = models.ForeignKey(Crianca, on_delete=models.CASCADE, related_name = "tentativas_questionario")
    ano = models.IntegerField()
    mes = models.IntegerField()
    score_total = models.IntegerField(default=0)
    resultado = models.CharField(max_length=30, default="")
    finalizado = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("crianca", "ano", "mes") # uma única tentativa por mês
    def __str__(self):
        return f"{self.crianca.nome} - {self.mes}/{self.ano}"



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

    pontos = models.IntegerField(default=0)
    ordem = models.PositiveIntegerField(default=1) # ordem das alternativas

    def __str__(self):
        return f"{self.pergunta.texto} - {self.texto}"


class Resposta(models.Model):
    tentativa = models.ForeignKey(TentativaMensal, on_delete=models.CASCADE, related_name="respostas")
    pergunta = models.ForeignKey(Pergunta, on_delete=models.CASCADE)
    alternativa = models.ForeignKey(Alternativa, on_delete=models.CASCADE, null=True, blank=True)
    data = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("tentativa", "pergunta") # uma respostas por pergunta