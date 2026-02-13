from django.db import models

# Create your models here.

from django.db import models

class Crianca(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    senha = models.CharField(max_length=128)

    def __str__(self):
        return self.nome
