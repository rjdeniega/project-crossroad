from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import *


class DriversAssignedSerializer(ModelSerializer):
    class Meta:
        model = DriversAssigned
        exclude = ('shift', )


# TODO validate if added shift has a start_date < expire_date of latest added shift
class ShiftSerializer(ModelSerializer, serializers.Serializer):
    drivers_assigned = DriversAssignedSerializer(many=True, write_only=True)

    class Meta:
        model = Shift
        fields = '__all__'

    def create(self, validated_data):
        drivers_data = validated_data.pop('drivers_assigned')
        shift = Shift.objects.create(**validated_data)
        for driver_data in drivers_data:
            DriversAssigned.objects.create(shift=shift, **driver_data)
        return shift

    def validate(self, data):
        shifts = Shift.objects.all()
        for shift in shifts:
            if data['start_date'] <= shift.end_date:
                raise serializers.ValidationError("start date of shift is conflicting with other existing shifts")
        return data


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

