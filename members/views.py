from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import *


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
        x = "accessed post request"
        return Response(data={
            'message': x
        }, status=200)
