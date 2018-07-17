from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from remittances.serializers import *
from .models import *
import json
from datetime import datetime


class ScheduleView(APIView):
    @staticmethod
    def get(request):
        schedules = ScheduleSerializer(Schedule.objects.all(), many=True)
        temp_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        active_sched = ScheduleSerializer(temp_sched)
        days_left = temp_sched.end_date - datetime.now().date()
        return Response(data={
            "days_left": days_left.days,
            "active_sched": active_sched.data,
            "schedules": schedules.data,
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        schedule_serializer = ScheduleSerializer(data=data)
        if schedule_serializer.is_valid():
            schedule = schedule_serializer.create(validated_data=schedule_serializer.validated_data)
            print(schedule_serializer.errors)
            return Response(data={
                "start_date": schedule.start_date,
                "end_date": schedule.end_date
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": schedule_serializer.errors
            })


# Ignore this class for now
class ShiftView(APIView):
    @staticmethod
    def get(request):
        # edit filter later on what is needed
        shifts = ShiftSerializer(Shift.objects.all(), many=True)
        return Response(data={
            "shifts": shifts.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def delete(request, pk):
        Shift.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def put(request):
        pass


class ShiftIterationView(APIView):
    @staticmethod
    def get(request):
        shift_iterations = ShiftIterationSerializer(ShiftIteration.objects.all(), many=True)
        return Response(data={
            "shift_iterations": shift_iterations.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        shift_iteration_serializer = ShiftIterationSerializer(data=data)
        if shift_iteration_serializer.is_valid():
            shift_iteration = shift_iteration_serializer.create(
                validated_data=shift_iteration_serializer.validated_data)
            return Response(data={
                'shift_id': shift_iteration.shift.id,
                'date': shift_iteration.date
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                'errors': shift_iteration_serializer.errors
            })


class PlannedDrivers(APIView):
    @staticmethod
    def get(request, supervisor_id):
        print(supervisor_id)
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor=supervisor_id)
        drivers_assigned = PlannedDriversSerializer(
            DriversAssigned.objects.filter(shift=current_shift.id),
            many=True)
        return Response(data={
            "drivers_assigned": drivers_assigned.data
        }, status=status.HTTP_200_OK)


class NonDeployedDrivers(APIView):
    @staticmethod
    def get(request, supervisor_id):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor=supervisor_id)
        shift_iteration = ShiftIteration.objects.get(shift=current_shift.id)
        deployed_drivers = Deployment.objects.filter(shift_iteration=shift_iteration.id)

        drivers = []
        for deployed_driver in deployed_drivers:
            drivers.append(deployed_driver)

        query = DriversAssigned.objects.filter(shift=current_shift.id)

        for driver in drivers:
            query = query.exclude(driver=driver.driver.id)

        non_deployed_drivers = PlannedDriversSerializer(query, many=True)

        return Response(data={
            "non_deployed_drivers": non_deployed_drivers.data
        }, status=status.HTTP_200_OK)


class SubDrivers(APIView):
    @staticmethod
    def get(request, supervisor_id):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor_id=supervisor_id)
        drivers_assigned = PlannedDriversSerializer(
            DriversAssigned.objects.filter(shift__schedule=active_sched.id).exclude(shift=current_shift.id),
            many=True)
        return Response(data={
            "sub_drivers": drivers_assigned.data
        }, status=status.HTTP_200_OK)


class DeploymentView(APIView):
    @staticmethod
    def get(request):
        deployments = GetDeploymentSerializer(Deployment.objects.all(), many=True)

        return Response(data={
            "deployments": deployments.data,
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        supervisor_id = data.pop('supervisor')
        deployment_serializer = DeploymentSerializer(data=data)
        if deployment_serializer.is_valid():
            deployment = deployment_serializer.create(
                validated_data=deployment_serializer.validated_data,
                supervisor_id=supervisor_id
            )
            return Response(data={
                'deployment': deployment.status
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": deployment_serializer.errors
            })

    @staticmethod
    def delete(request, pk):
        Deployment.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DeployedDrivers(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        supervisor_id = data['supervisor_id']
        current_shift_iteration = ShiftIteration.objects.filter(shift__supervisor=supervisor_id).order_by(
            "-date").first()
        deployments = Deployment.objects.filter(shift_iteration_id=current_shift_iteration.id)
        deployments_serializer = DeploymentSerializer(deployments, many=True)
        for item in deployments_serializer.data:
            driver = Driver.objects.get(id=item.get('driver'))
            item["driver_name"] = driver.name
        return Response(data={
            "deployed_drivers": deployments_serializer.data
        }, status=status.HTTP_200_OK)


class RemittanceUtilities():
    @staticmethod
    def get_active_schedule():
        active_schedule = Schedule.objects.get(
            start_date__lte=datetime.now().date(),
            end_date__gte=datetime.now().date())
        return active_schedule

    # this function returns the current latest shift_iteration for the shift
    @staticmethod
    def get_shift_iteration(shift_id):
        shift_iteration = ShiftIteration.objects.filter(shift=shift_id).order_by("-date").first()
        return shift_iteration

    # this function expects that the driver could only be assigned to one shift
    @staticmethod
    def get_shift_of_driver(driver_id):
        active_sched = RemittanceUtilities.get_active_schedule()
        shifts = Shift.objects.filter(schedule=active_sched.id)
        for shift in shifts:
            drivers_assigned = DriversAssigned.objects.filter(shift=shift.id)
            for driver_assigned in drivers_assigned:
                if driver_assigned.driver_id == driver_id:
                    return shift
        return None


class DeploymentDetails(APIView):
    # to get deployment data of the driver for today
    # this expects that a driver could only be deployed once a day
    # change the algorithm if the driver could be deployed more than once
    @staticmethod
    def get(request, driver_id):
        shift = RemittanceUtilities.get_shift_of_driver(driver_id)
        shift_iteration = RemittanceUtilities.get_shift_iteration(shift.id)
        deployment_query = Deployment.objects.get(shift_iteration=shift_iteration)
        deployment = DeploymentSerializer(deployment_query)
        assigned_tickets_query = AssignedTicket.objects.filter(deployment=deployment_query.id)

        assigned_tickets = AssignedTicketSerializer(assigned_tickets_query, many=True)
        data = list()
        data.append({'deployment': deployment.data})
        data.append({'assigned_tickets': assigned_tickets.data})

        key = 'void_ticket_'
        val = 1

        # add void ticket to data
        # note that the returned void_tickets is arranged by the returned assigned_tickets
        for assigned_ticket in assigned_tickets_query:
            void_tickets = VoidTicket.objects.filter(assigned_ticket=assigned_ticket.id)
            serialized = VoidTicketSerializer(void_tickets, many=True)
            key += str(val)
            data.append({key: serialized.data})
            val += 1
            key = 'void_ticket_'

        return Response(data={
            'deployment_details': data
        }, status=status.HTTP_200_OK)


class RemittanceFormView(APIView):
    @staticmethod
    def get(request):
        remittance_forms = RemittanceFormSerializer(RemittanceForm.objects.all(), many=True)
        am_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift_iteration__shift__type='A'),
                                            many=True)
        pm_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift_iteration__shift__type='P'),
                                            many=True)
        mn_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift_iteration__shift__type='M'),
                                            many=True)

        return Response(data={
            "remittance_forms": remittance_forms.data,
            "am_forms": am_forms.data,
            "pm_forms": pm_forms.data,
            "mn_forms": mn_forms.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        remittance_serializer = RemittanceFormSerializer(data=data)
        if remittance_serializer.is_valid():
            remittance_form = remittance_serializer.create(validated_data=remittance_serializer.validated_data)
            return Response(data={
                "total": remittance_form.total
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": remittance_serializer.errors
            })

    @staticmethod
    def delete(request, pk):
        RemittanceForm.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ConfirmRemittanceForm(APIView):
    # this get function returns all the unconfirmed remittances that the supervisor needs to approve
    @staticmethod
    def get(request, supervisor_id):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor_id=supervisor_id)
        current_iteration = ShiftIteration.objects.get(shift=current_shift.id, date=datetime.now().date())
        query = RemittanceForm.objects.filter(status='P', deployment__shift_iteration=current_iteration.id)
        unconfirmed_remittances = RemittanceFormSerializer(query, many=True)
        return Response(data={
            "unconfirmed_remittances": unconfirmed_remittances.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        remittance_form_id = data['remittance_form_id']
        remittance_form = RemittanceForm.objects.get(id=remittance_form_id)
        remittance_form.confirm_remittance()
        remittance_form = RemittanceFormSerializer(remittance_form)
        return Response(data={
            "remittance_form": remittance_form.data
        }, status=status.HTTP_200_OK)


class ShiftIterationReport(APIView):
    @staticmethod
    def get(request, shift_iteration_id):
        remittances = RemittanceForm.objects.filter(deployment__shift_iteration=shift_iteration_id)

        total = 0
        for remittance in remittances:
            total += remittance.total

        serialized = ReadRemittanceSerializer(remittances, many=True)

        # get shift details
        shift_iteration = ShiftIteration.objects.get(id=shift_iteration_id)

        return Response(data={
            'remittances': serialized.data,
            'total': total,
            'shift_type': shift_iteration.shift.type,
            'date_of_iteration': shift_iteration.date
        }, status=status.HTTP_200_OK)

