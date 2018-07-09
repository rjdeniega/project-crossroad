from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from datetime import datetime, timedelta
from .models import *


class DriversAssignedSerializer(ModelSerializer):
    class Meta:
        model = DriversAssigned
        exclude = ('shift',)


class ShiftSerializer(ModelSerializer, serializers.Serializer):
    drivers_assigned = DriversAssignedSerializer(many=True, write_only=True)

    class Meta:
        model = Shift
        exclude = ('schedule',)

    def create(self, validated_data):
        drivers_data = validated_data.pop('drivers_assigned')
        shift = Shift.objects.create(**validated_data)
        for driver_data in drivers_data:
            DriversAssigned.objects.create(shift=shift, **validated_data)
        return shift


class ScheduleSerializer(ModelSerializer):
    shifts = ShiftSerializer(many=True, write_only=True)

    class Meta:
        model = Schedule
        exclude = ('end_date',)

    def create(self, validated_data):
        shifts_data = validated_data.pop('shifts')
        schedule = Schedule.objects.create(**validated_data)
        schedule.end_date = schedule.start_date + timedelta(days=14)  # start_date + 14 days = 15 days
        schedule.save()
        new_sched = Schedule.objects.get(id=schedule.id)  # gets django object to be used
        for shift_data in shifts_data:
            drivers_data = shift_data.pop('drivers_assigned')
            shift = Shift.objects.create(schedule=new_sched, **shift_data)
            for driver_data in drivers_data:
                DriversAssigned.objects.create(shift=shift, **driver_data)
        return schedule

    # TODO validate that there are am shifts, pm shifts, and mn shifts in the schedule
    def validate(self, data):
        schedules = Schedule.objects.all()
        for schedule in schedules:
            if data['start_date'] <= schedule.end_date:
                raise serializers.ValidationError("start date of schedule is conflicting with other existing schedule")
        return data


class ShiftIterationSerializer(ModelSerializer, serializers.Serializer):
    supervisor = serializers.IntegerField(write_only=True)

    class Meta:
        model = ShiftIteration
        fields = '__all__'
        depth = 2

    def create(self, validated_data):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, **validated_data)
        shift_iteration = ShiftIteration.objects.create(shift=current_shift)
        return shift_iteration


class VoidTicketSerializer(ModelSerializer):
    class Meta:
        model = VoidTicket
        exclude = ('assigned_ticket',)


class AssignedTicketSerializer(ModelSerializer):
    void_ticket = VoidTicketSerializer(many=True, write_only=True)

    class Meta:
        model = AssignedTicket
        exclude = ('deployment',)


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
        exclude = ('remittance_form',)


# TODO validation that consumed_ticket.end_ticket is within range of assigned_ticket
class RemittanceFormSerializer(ModelSerializer):
    consumed_ticket = ConsumedTicketSerializer(many=True, write_only=True)

    class Meta:
        model = RemittanceForm
        fields = '__all__'

    # assigned_ticket id is expected to be within validated_data
    def create(self, validated_data):
        consumed_tickets_data = validated_data.pop('consumed_ticket')
        remittance_form = RemittanceForm.objects.create(**validated_data)

        for consumed_ticket_data in consumed_tickets_data:
            consumed_ticket = ConsumedTicket.objects.create(remittance_form=remittance_form, **consumed_ticket_data)
            assigned_ticket = AssignedTicket.objects.get(id=consumed_ticket.assigned_ticket.id)

            if assigned_ticket.type == 'A':
                consumed_ticket.total = 9 * (consumed_ticket.end_ticket - assigned_ticket.range_from)
            elif assigned_ticket.type == 'B':
                consumed_ticket.total = 11 * (consumed_ticket.end_ticket - assigned_ticket.range_from)
            else:
                consumed_ticket.total = 14 * (consumed_ticket.end_ticket - assigned_ticket.range_from)

            consumed_ticket.save()
            remittance_form.total += consumed_ticket.total
            remittance_form.save()

        remittance_form.total -= remittance_form.fuel_cost + remittance_form.other_cost
        remittance_form.save()
        return remittance_form
