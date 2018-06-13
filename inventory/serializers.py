from rest_framework.serializers import ModelSerializer
from .models import *


class ItemSerializer(ModelSerializer):
    class Meta:

        model = Item
        fields = "__all__"
