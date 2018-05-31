from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView

from members.serializers import PersonSerializer, DriverSerializer
from .models import *
import json


class DriverView(APIView):
    @staticmethod
    def get(request):
        # transform django objects to JSON (so it can be interpreted in the front-end_
        drivers = DriverSerializer(Driver.objects.all(), many=True)
        # returns all driver objects
        return Response(data={
            "drivers": drivers.data
        }, status=200)

    @staticmethod
    def post(request):
        # extracts the body from the request
        data = json.loads(request.body)

        # transform JSON into python object
        # please read serializers.py Person and Driver serializer
        driver_serializer = DriverSerializer(data=data)

        if driver_serializer.is_valid():
            # Serializer class has a built in function that creates
            #  an object attributed to it
            # I pass the validated data and it creates the object
            driver = driver_serializer.create(validated_data=
                                              driver_serializer.validated_data)
            return Response(data={
                'driver_name': driver.name
            }, status=200)
        else:
            return Response(data={
                "errors": driver_serializer.errors
            })
