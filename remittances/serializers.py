from rest_framework.serializers import ModelSerializer
from .models import *


class DriversAssignedSerializer(ModelSerializer):
    class Meta:
        model = DriversAssigned
        exclude = ('shift', )


class ShiftSerializer(ModelSerializer):
    drivers_assigned = DriversAssignedSerializer(many=True)

    class Meta:
        model = Shift
        fields = '__all__'

    # TODO test if it works
    def create(self, validated_data):
        drivers_data = validated_data.pop('drivers_assigned')
        shift = Shift.objects.create(**validated_data)
        for driver_data in drivers_data:
            DriversAssigned.objects.create(shift=shift, **driver_data)
        return shift


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


class AssignedTicketSerializer(ModelSerializer):
    class Meta:
        model = AssignedTicket
        fields = '__all__'


class ConsumedTicketSerializer(ModelSerializer):
    class Meta:
        model = ConsumedTicket
        fields = '__all__'

