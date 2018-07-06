from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import *


class DriversAssignedSerializer(ModelSerializer):
    class Meta:
        model = DriversAssigned
        exclude = ('shift', )


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
        shifts = Shift.objects.filter(type=data['type']) # there could be 3 shifts in a date span
        for shift in shifts:
            if data['start_date'] <= shift.end_date:
                raise serializers.ValidationError("start date of shift is conflicting with other existing shifts")
        return data


class VoidTicketSerializer(ModelSerializer):
    class Meta:
        model = VoidTicket
        exclude = ('assigned_ticket', )


class AssignedTicketSerializer(ModelSerializer):
    void_ticket = VoidTicketSerializer(many=True, write_only=True)

    class Meta:
        model = AssignedTicket
        exclude = ('deployment', )



class DeploymentSerializer(ModelSerializer):
    assigned_tickets = serializers.StringRelatedField(many=True)

    class Meta:
        model = Deployment
        fields = '__all__'


    def create(self, validated_data):
        assigned_tickets_data = validated_data.pop('assigned_ticket')
        deployment = Deployment.objects.create(**validated_data)

        for assigned_ticket_data in assigned_tickets_data:
            void_tickets_data = assigned_ticket_data.pop('void_ticket')
            assigned_ticket = AssignedTicket.objects.create(deployment=deployment, **assigned_ticket_data)

            for void_ticket_data in void_tickets_data:
                VoidTicket.objects.create(assigned_ticket=assigned_ticket, **void_ticket_data)
        return deployment


class ConsumedTicketSerializer(ModelSerializer):
    class Meta:
        model = ConsumedTicket
        fields = '__all__'


class RemittanceFormSerializer(ModelSerializer):
    consumed_ticket = ConsumedTicketSerializer(many=True, write_only=True)

    class Meta:
        model = RemittanceForm
        fields = '__all__'

    def create(self, validated_data):
        remittance_form = RemittanceForm()
        consumed_tickets_data = validated_data.pop('consumed_tickets')






