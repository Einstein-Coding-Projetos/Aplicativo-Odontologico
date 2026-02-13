from django.db import models
from django.contrib.auth.models import User

class Crianca(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    nome = models.CharField(max_length=100)
    pontos_totais = models.IntegerField(default=0)
    nivel = models.IntegerField(default=1)

    def __str__(self):
        return self.nome


class PerfilEducacional(models.Model):
    crianca = models.OneToOneField(Crianca, on_delete=models.CASCADE)
    escova_noite = models.BooleanField(default=False)
    usa_fio_dental = models.BooleanField(default=False)
    conhecimento_geral = models.IntegerField(default=0)

    def __str__(self):
        return f"Perfil de {self.crianca.nome}"


class PartidaJogo(models.Model):
    crianca = models.ForeignKey(Crianca, on_delete=models.CASCADE)
    pontos = models.IntegerField()
    criada_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crianca.nome} - {self.pontos} pontos"


class Badge(models.Model):
    nome = models.CharField(max_length=50)
    pontos_minimos = models.IntegerField()

    def __str__(self):
        return self.nome


class CriancaBadge(models.Model):
    crianca = models.ForeignKey(Crianca, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    data = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('crianca', 'badge')

