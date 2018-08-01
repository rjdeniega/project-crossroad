from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from members.serializers import *
from remittances.models import *
from remittances.serializers import BeepTransactionSerializer
from .models import *
import json


class SupervisorView(APIView):
    @staticmethod
    def get(request):
        supervisors = SupervisorSerializer(Supervisor.objects.all(), many=True)
        return Response(data={
            "supervisors": supervisors.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        supervisor_serializer = SupervisorSerializer(data=data)
        if supervisor_serializer.is_valid():
            supervisor = supervisor_serializer.create(validated_data=supervisor_serializer.validated_data)
            return Response(data={
                "supervisor": supervisor.name
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": supervisor_serializer.errors
            })


class ClerkView(APIView):
    @staticmethod
    def get(request):
        clerks = ClerkSerializer(Clerk.objects.all(), many=True)
        return Response(data={
            "clerks": clerks.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        clerk_serializer = SupervisorSerializer(data=data)
        if clerk_serializer.is_valid():
            clerk = clerk_serializer.create(validated_data=clerk_serializer.validated_data)
            return Response(data={
                "clerk": clerk.name
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": clerk_serializer.errors
            })


class OperationsManagerView(APIView):
    @staticmethod
    def get(request):
        operations_manager = OperationsManagerSerializer(OperationsManager.objects.all(), many=True)
        return Response(data={
            "operations_managers": operations_manager.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        operations_manager_serializer = OperationsManagerSerializer(data=data)
        if operations_manager_serializer.is_valid():
            operations_manager = operations_manager_serializer.create(
                validated_data=operations_manager_serializer.validated_data)
            return Response(data={
                "operations_manager": operations_manager.name
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": operations_manager_serializer.errors
            })


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
                'driver': driver.name
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": driver_serializer.errors
            })


class MemberView(APIView):
    @staticmethod
    def get(request):
        members = MemberSerializer(Member.objects.all(), many=True)
        for item in members.data:
            try:
                id_card = IDCards.objects.filter(member=Member.objects.get(pk=item["id"])).first()
            except ObjectDoesNotExist:
                id_card = None

            if id_card is not None:
                card_number = id_card.can
            else:
                card_number = None

            item["card_number"] = card_number

        return Response(data={
            "members": members.data
        }, status=status.HTTP_200_OK)

    # gets all the IDCards for the member
    # member_key is the primary key of the Member
    # not sure if it should be here or if there should be a separate class
    # TODO test this
    @staticmethod
    def get_id_cards(request, member_id):
        id_cards = IDCardSerializer(IDCards.objects.get(member=member_id), many=True)
        return Response(data={
            "idcards": id_cards.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        member_serializer = MemberSerializer(data=data)

        if member_serializer.is_valid():
            member = member_serializer.create(validated_data=member_serializer.validated_data)

            return Response(data={
                'member': member.name
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

    # TODO function for adding prospects

    @staticmethod
    def delete(request, pk):
        Prospect.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MemberTransactionView(APIView):
    @staticmethod
    def get(request, member_id):
        id_card = IDCards.objects.get(member=Member.objects.get(pk=member_id))
        transactions = BeepTransaction.objects.filter(card_number=id_card.can)
        print(transactions)
        serialized_transactions = BeepTransactionSerializer(transactions, many=True)
        for item in serialized_transactions.data:
            item["shift_date"] = BeepShift.objects.get(pk=item["shift"]).date
        return Response(data={
            "transactions": serialized_transactions.data,
            "total_transactions": sum([float(item["total"]) for item in serialized_transactions.data])
        }, status=status.HTTP_200_OK)


class MemberSharesView(APIView):
    @staticmethod
    def get(request, member_id):
        shares = Share.objects.filter(member=Member.objects.get(pk=member_id))
        serialized_shares = ShareSerializer(shares, many=True)

        for item in serialized_shares.data:
            item["peso_value"] = float(item["value"]) * 500

        return Response(data={
            "shares": serialized_shares.data,
            "total_shares": sum([float(item["value"]) for item in serialized_shares.data]),
            "total_peso_value": sum([float(item["peso_value"]) for item in serialized_shares.data])
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, member_id):
        body = json.loads(request.body)
        share = None

        data = {
            "member": Member.objects.get(pk=member_id),
            "value": body["value"],
            "date_of_update": body["date"],
            "receipt": body["receipt"],
        }
        share_serializer = ShareSerializer(data=data)
        print(share_serializer.is_valid())
        print(share_serializer.errors)

        if share_serializer.is_valid():
            share = share_serializer.create(validated_data=share_serializer.validated_data)
        else:
            return Response(data={
                "errors": share_serializer.errors
            }, status=400)
        print(ShareSerializer(share).data)
        return Response(data={
            "share": ShareSerializer(share).data,
        }, status=status.HTTP_200_OK)
