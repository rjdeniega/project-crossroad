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


class DeploymentView(APIView):
    @staticmethod
    def get(request):
        deployments = DeploymentSerializer(Deployment.objects.all(), many=True)

        # edit later
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
    def get(request):
        current_shift_iteration = ShiftIteration.objects.order_by("-date").first()
        deployments = Deployment.objects.filter(shift_iteration_id=current_shift_iteration.id)
        deployments_serializer = DeploymentSerializer(deployments, many=True)
        return Response(data={
            "deployed_drivers": deployments_serializer.data
        }, status=status.HTTP_200_OK)

class RemittanceFormView(APIView):
    @staticmethod
    def get(request):
        remittance_forms = RemittanceFormSerializer(RemittanceForm.objects.all(), many=True)
        am_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift_iteration__shift__type='A'), many=True)
        pm_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift_iteration__shift__type='P'), many=True)
        mn_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift_iteration__shift__type='M'), many=True)

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
