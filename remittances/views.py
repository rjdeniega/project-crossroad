from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from remittances.serializers import *
from .models import *
import json


class AssignedTicketView(APIView):
    @staticmethod
    def get(request):
        assigned_tickets = AssignedTicketSerializer(AssignedTicket.objects.all(), many=True)

        return Response(data={
            "assigned_tickets": assigned_tickets.data
        }, status=status.HTTP_200_OK)


    @staticmethod
    def post(request):
        data = json.loads(request.body)
        assigned_tickets_serializer = AssignedTicketSerializer(data=data)

        if assigned_tickets_serializer.is_valid():
            assigned_tickets = assigned_tickets_serializer.create(validated_data=assigned_tickets_serializer.validated_data)

            return Response(data={
                "assigned_tickets_range_from": assigned_tickets.range_from,
                "assigned_tickets_range_to": assigned_tickets.range_to,
                "assigned_tickets_driver": assigned_tickets.driver
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": assigned_tickets_serializer.errors
            })


    @staticmethod
    def delete(request, pk):
        AssignedTicket.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)


    @staticmethod
    def put(request):
        pass


class VoidTicketView(APIView):
    @staticmethod
    def get(request):
        void_tickets = VoidTicketSerializer(VoidTicket.objects.all(), many=True)

        return Response(data={
            "void_tickets": void_tickets.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        void_tickets_serializer = AssignedTicketSerializer(data=data)

        if void_tickets_serializer.is_valid():
            void_ticket = void_tickets_serializer.create(
                validated_data=void_tickets_serializer.validated_data)

            return Response(data={
                "void_ticket_ticket": void_ticket.ticket_number
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": void_tickets_serializer.errors
            })

    @staticmethod
    def delete(request, pk):
        VoidTicket.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)