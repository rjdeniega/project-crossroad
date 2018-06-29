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

