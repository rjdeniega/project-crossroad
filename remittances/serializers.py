from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from datetime import datetime, timedelta
from .models import *
from calendar import monthrange
import calendar


class DriversAssignedSerializer(ModelSerializer):
    class Meta:
        model = DriversAssigned
        exclude = ('shift',)
        depth = 2


class PlannedDriversSerializer(ModelSerializer):
    class Meta:
        model = DriversAssigned
        fields = '__all__'
        depth = 2


class ShiftSerializer(ModelSerializer, serializers.Serializer):
    drivers_assigned = DriversAssignedSerializer(many=True, write_only=True)

    class Meta:
        model = Shift
        exclude = ('schedule',)

    def create(self, validated_data):
        drivers_data = validated_data.pop('drivers_assigned')
        shift = Shift.objects.create(**validated_data)
        for data in drivers_data:
            DriversAssigned.objects.create(shift=shift,
                                           driver_id=data['driver'],
                                           shuttle_id=data['shuttle'])
        return shift


class ScheduleSerializer(ModelSerializer):
    shifts = ShiftSerializer(many=True, write_only=True)

    class Meta:
        model = Schedule
        exclude = ('end_date',)

    def create(self, validated_data,original):
        print(validated_data)
        print(original)
        shifts_data = original.pop('shifts')
        schedule = Schedule.objects.create(**original)
        date = datetime.strptime(schedule.start_date, "%Y-%m-%d")
        if date.day < 16:
            schedule.end_date = date + timedelta(days=14)  # start_date + 14 days = 15 days (changed to +15 since every 15 days)
        else:
            end_day = calendar.monthrange(date.year,date.month)[1]
            schedule.end_date = datetime(date.month,end_day,date.year)
        schedule.save()
        new_sched = Schedule.objects.get(id=schedule.id)  # gets django object to be used
        for shift_data in shifts_data:
            drivers_data = shift_data.pop('drivers_assigned')
            shift_data_dict = {
                "type": shift_data['type'],
                "supervisor": Supervisor.objects.get(pk=shift_data['supervisor'])
            }
            shift = Shift.objects.create(schedule=new_sched, **shift_data_dict)
            for driver_data in drivers_data:
                shuttle_id = driver_data.pop('shuttle')
                driver_id = driver_data.pop('driver')
                deployment_type = driver_data.pop('deployment_type')

                # if deployment_type is 'Early':
                #     type = 'E'
                # elif deployment_type is 'Late':
                #     type = 'L'
                # else:
                #     type = 'R'

                DriversAssigned.objects.create(shift=shift,
                                               deployment_type=deployment_type,
                                               driver=Driver.objects.get(pk=driver_id),
                                               shuttle=Shuttle.objects.get(pk=shuttle_id))

        return schedule




    # TODO validate that there are am shifts, pm shifts, and mn shifts in the schedule
    def validate(self, data):
        schedules = Schedule.objects.all()
        for schedule in schedules:
             if data['start_date'] <= schedule.end_date:
                 raise serializers.ValidationError("start date of schedule is conflicting with other existing schedule")

        for shift in data['shifts']:
            drivers = 0
            for driver in shift['drivers_assigned']:
                drivers += 1

            if shift['type'] == "A":
                shift_type = "AM Shift"
            else:
                shift_type = "PM Shift"

            # if drivers is not 7:
            #     raise serializers.ValidationError("Drivers Assigned for " + shift_type + " is not 7")

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

    def validate(self, data):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor_id=data['supervisor'])
        shift_iterations = ShiftIteration.objects.filter(shift=current_shift.id, date=datetime.now().date())
        for shift_iteration in shift_iterations:
            if shift_iteration.shift.type == 'A':
                raise serializers.ValidationError("an AM shift was already started today")
            elif shift_iteration.shift.type == 'P':
                raise serializers.ValidationError("a PM shift was already started today")
            else:
                raise serializers.ValidationError("an MN shift was already started today")
        return data


class VoidTicketSerializer(ModelSerializer):
    class Meta:
        model = VoidTicket
        exclude = ('assigned_ticket',)


class AssignedTicketSerializer(ModelSerializer):
    void_ticket = VoidTicketSerializer(many=True, write_only=True)

    class Meta:
        model = AssignedTicket
        fields = '__all__'

    def validate(self, data):
        if data['range_from']:
            if data['range_from'] >= data['range_to']:
                raise serializers.ValidationError("starting ticket should be lower than the ending ticket")
        return data


class DeploymentSerializer(ModelSerializer):
    class Meta:
        model = Deployment
        exclude = ('shift_iteration', 'route')

    def create(self, validated_data, supervisor_id, driver_id):
        # get shift_iteration_id
        current_shift_iteration = ShiftIteration.objects.filter(shift__supervisor=supervisor_id).order_by(
            '-date').first()
        drivers_assigned = DriversAssigned.objects.get(shift=current_shift_iteration.shift, driver_id=driver_id)
        deployment = Deployment.objects.create(
            shift_iteration=current_shift_iteration,
            driver=driver_id,
            route=drivers_assigned.shuttle.route,
            **validated_data
        )

        return deployment

    def validate(self, data):
        # check if shuttle is currently unavailable
        print(data['supervisor'])
        current_shift_iteration = ShiftIteration.objects.filter(shift__supervisor_id=data['supervisor']).order_by(
            '-date').first()
        driver_assigned = DriversAssigned.objects.get(shift=current_shift_iteration.shift, driver_id=data['driver'])

        if driver_assigned.shuttle.status is 'UM':
            error_message = driver_assigned.driver.name + "'s shuttle is currently " + driver_assigned.shuttle.get_status_display()
            raise serializers.ValidationError(error_message)

        return data





class GetDeploymentSerializer(ModelSerializer):
    assigned_tickets = serializers.StringRelatedField(many=True, read_only=True)  # for reading

    class Meta:
        model = Deployment
        fields = '__all__'
        depth = 2


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

            if assigned_ticket.range_from is not None and assigned_ticket.range_to is not None:
                # subtract those void tickets
                voided = 0  # number of voided tickets
                void_tickets = VoidTicket.objects.filter(assigned_ticket=assigned_ticket.id)
                void_tickets = [item for item in void_tickets if item.ticket_number <= consumed_ticket.end_ticket]
                for void_ticket in void_tickets:
                    voided += 1

                # compute number of tickets
                number_of_tickets = consumed_ticket.end_ticket - assigned_ticket.range_from - voided + 1

                if assigned_ticket.type == 'A':
                    consumed_ticket.total = 10 * number_of_tickets
                    print("A", consumed_ticket.total)
                elif assigned_ticket.type == 'B':
                    consumed_ticket.total = 12 * number_of_tickets
                    print("B", consumed_ticket.total)
                else:
                    consumed_ticket.total = 15 * number_of_tickets
                    print("C", consumed_ticket.total)

                consumed_ticket.save()
                remittance_form.total += consumed_ticket.total
                print("Total", remittance_form.total)
                remittance_form.save()

        remittance_form.total -= remittance_form.fuel_cost + remittance_form.other_cost
        remittance_form.save()

        # update deployment data to finished
        deployment = Deployment.objects.get(id=remittance_form.deployment_id)
        deployment.status = 'F'
        deployment.end_deployment()
        deployment.save()

        return remittance_form

    def validate(self, data):
        for ticket in data['consumed_ticket']:
            assigned_ticket_id = ticket['assigned_ticket']
            end_ticket = ticket['end_ticket']

            assigned_ticket = AssignedTicket.objects.get(id=assigned_ticket_id.id)

            if assigned_ticket.range_from is not None:
                if end_ticket > assigned_ticket.range_to or end_ticket < assigned_ticket.range_from:
                    raise serializers.ValidationError("End Ticket is not in range")
        return data


class ReadRemittanceSerializer(ModelSerializer):
    class Meta:
        model = RemittanceForm
        fields = '__all__'


class BeepShiftSerializer(ModelSerializer):
    class Meta:
        model = BeepShift
        fields = '__all__'


class BeepTransactionSerializer(ModelSerializer):
    class Meta:
        model = BeepTransaction
        fields = '__all__'


class CarwashTransactionSerializer(ModelSerializer):
    class Meta:
        model = CarwashTransaction
        fields = '__all__'
