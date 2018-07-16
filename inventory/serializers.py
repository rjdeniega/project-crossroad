from rest_framework.serializers import ModelSerializer
from .models import *


class ItemSerializer(ModelSerializer):
    class Meta:
        model = Item
        fields = "__all__"


class MovementSerializer(ModelSerializer):
    class Meta:
        model = ItemMovement
        fields = "__all__"
