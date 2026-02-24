from rest_framework import serializers
from .models import Pergunta, Alternativa, Resposta


class AlternativaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alternativa
        fields = ["id", "texto", "pontos", "ordem"]


class PerguntaSerializer(serializers.ModelSerializer):
    alternativas = AlternativaSerializer(many=True, read_only=True)

    class Meta:
        model = Pergunta
        fields = ["id", "texto", "alternativas"]


class ResponderSerializer(serializers.Serializer):
    crianca_id = serializers.IntegerField()
    pergunta_id = serializers.IntegerField()
    alternativa_id = serializers.IntegerField()