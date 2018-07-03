from rest_framework.serializers import ModelSerializer
from .models import *


class AssignedTicketSerializer(ModelSerializer):
    class Meta:
        model = AssignedTicket
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


class ConsumedTicketsSerializer(ModelSerializer):
    class Meta:
        model = ConsumedTickets
        fields = '__all__'

