from rest_framework.serializers import ModelSerializer
from .models import *


class ShiftSerializer(ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'


class VoidTicketSerializer(ModelSerializer):
    class Meta:
        model = VoidTicket
        fields = '__all__'


class DeploymentSerializer(ModelSerializer):
    class Meta:
        model = Deployment
        fields = '__all__'


class RemittanceFormSerializer(ModelSerializer):
    class Meta:
        model = RemittanceForm
        fields = '__all__'

