from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from members.serializers import *
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
        }, status=status.HTTP_200_OK)
        # Using bare status codes in your responses isn't recommended. REST framework
        # includes a set of named constants that you can use to make your code more obvious and readable.

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
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": driver_serializer.errors
            })


class MemberView(APIView):
    @staticmethod
    def get(request):
        members = MemberSerializer(Member.objects.all(), many=True)
        return Response(data={
            "members": members.data
        }, status=status.HTTP_200_OK)

    #gets all the IDCards for the member
    #member_ket is the primary key of the Member
    #not sure if it should be here or if there should be a separate class
    #TODO test this
    @staticmethod
    def get_IDCards(request, member_key):
        idcards = IDCardSerializer(IDCards.objects.get(member=member_key), many=True)
        return Response(data={
            "idcards": idcards.data
        }, status=status.HTTP_200_OK)


    @staticmethod
    def post(request):
        data = json.loads(request.body)
        member_serializer = MemberSerializer(data=data)

        if member_serializer.is_valid():
            member = member_serializer.create(validated_data=member_serializer.validated_data)

            return Response(data={
                'member_name': member.name
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": member_serializer.errors
            })

    @staticmethod
    def delete(request, pk):
        Member.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProspectView(APIView):
    @staticmethod
    def get(request):
        prospects = ProspectSerializer(Prospect.objects.all(), many=True)
        return Response(data={
            "prospects": prospects.data
        }, status=status.HTTP_200_OK)

    #TODO function for adding prospects

    @staticmethod
    def delete(request, pk):
        Prospect.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)
