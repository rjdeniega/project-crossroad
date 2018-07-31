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


class ShuttlesSerializer(ModelSerializer):
    class Meta:
        model = Shuttle
        fields = "__all__"


class RepairSerializer(ModelSerializer):
    class Meta:
        model = Repair
        fields = "__all__"


class RepairProblemSerializer(ModelSerializer):
    class Meta:
        model = RepairProblem
        fields = "__all__"


class RepairFindingSerializer(ModelSerializer):
    class Meta:
        model = RepairFinding
        fields = "__all__"


class RepairModificationsSerializer(ModelSerializer):
    class Meta:
        model = RepairModifications
        fields = "__all__"
