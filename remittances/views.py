from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from remittances.serializers import *
from .models import *
import json

class ScheduleView(APIView):
    @staticmethod
    def get(request):
        schedules = ScheduleSerializer(Schedule.objects.all(), many=True)
        return Response(data={
            "schedules": schedules.data
        }, status=status.HTTP_200_OK)


class ShiftView(APIView):
    @staticmethod
    def get(request):
        # edit filter later on what is needed
        shifts = ShiftSerializer(Shift.objects.all(), many=True)
        return Response(data={
            "shifts": shifts.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        shift_serializer = ShiftSerializer(data=data)
        if shift_serializer.is_valid():
            shift = shift_serializer.create(validated_data=shift_serializer.validated_data)
            return Response(data={
                'shift_start': shift.start_date,
                'shift_end': shift.end_date
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": shift_serializer.errors
            })

    @staticmethod
    def delete(request, pk):
        Shift.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def put(request):
        pass


class DeploymentView(APIView):
    @staticmethod
    def get(request):
        deployments = DeploymentSerializer(Deployment.objects.all(), many=True)
        am_deployments = DeploymentSerializer(Deployment.objects.filter(shift__type='A'), many=True)
        pm_deployments = DeploymentSerializer(Deployment.objects.filter(shift__type='P'), many=True)
        mn_deployments = DeploymentSerializer(Deployment.objects.filter(shift__type='M'), many=True)

        # edit later
        return Response(data={
            "deployments": deployments.data,
            "am_deployments": am_deployments.data,
            "pm_deployments": pm_deployments.data,
            "mn_deployments": mn_deployments.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        deployment_serializer = DeploymentSerializer(data=data)
        if deployment_serializer.is_valid():
            deployment = deployment_serializer.create(validated_data=deployment_serializer.validated_data)

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


class RemittanceFormView(APIView):
    @staticmethod
    def get(request):
        remittance_forms = RemittanceFormSerializer(RemittanceForm.objects.all(), many=True)
        am_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift__type='A'), many=True)
        pm_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift__type='P'), many=True)
        mn_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift__type='M'), many=True)

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