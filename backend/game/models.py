from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


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
    crianca = models.ForeignKey(
        Crianca,
        on_delete=models.CASCADE,
        related_name="partidas"
    )
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
    crianca = models.ForeignKey(
        Crianca,
        on_delete=models.CASCADE,
        related_name="badges_conquistados"
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name="conquistas"
    )
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crianca.nome} ganhou {self.badge.nome} em {self.data.strftime('%d/%m/%Y')}"
    
class Premio(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    badge_requerida = models.ForeignKey(Badge, on_delete=models.CASCADE)
    quantidade_necessaria = models.IntegerField()

    def __str__(self):
        return self.nome


class ProgressoPremio(models.Model):
    crianca = models.ForeignKey(Crianca, on_delete=models.CASCADE)
    premio = models.ForeignKey(Premio, on_delete=models.CASCADE)
    quantidade_atual = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.crianca.nome} - {self.premio.nome}: {self.quantidade_atual}"


@receiver(post_save, sender=User)
def criar_perfil_crianca(sender, instance, created, **kwargs):
    if created:
        Crianca.objects.create(usuario=instance, nome=instance.username)