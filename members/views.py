from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView

from members.serializers import PersonSerializer
from .models import *
import json


class PersonHandler:
    @staticmethod
    def create_person(data):
        return Person.objects.create(data)


class DriverView(APIView):
    @staticmethod
    def get(request):
        return Response(data={
            'drivers': Driver.objects.all()
        }, status=200)

    @staticmethod
    def post(request):
        # get the request data in JSON format
        body = json.loads(request.body)

        # transform JSON into python dictionary
        person_serializer = PersonSerializer(data=body)

        if person_serializer.is_valid():
            # Serializer class has a built in function that creates
            #  an object attributed to it
            # I pass the validated data and it creates the object
            person = person_serializer.create(validated_data=
                                              person_serializer.validated_data)
            return Response(data={
                'person': person.name
            }, status=200)
        else:
            return Response(data={
                "errors": person_serializer.errors
            })
