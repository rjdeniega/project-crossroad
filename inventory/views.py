from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from inventory.serializers import *
from .models import *
import json


class ItemView(APIView):
    @staticmethod
    def get(request):
        # transform django objects to JSON (so it can be interpreted in the front-end_
        items = ItemSerializer(Item.objects.all(), many=True)
        # returns all item objects
        return Response(data={
            "items": items.data
        }, status=status.HTTP_200_OK)
        # Using bare status codes in your responses isn't recommended. REST framework
        # includes a set of named constants that you can use to make your code more obvious and readable.

    @staticmethod
    def post(request):
        # extracts the body from the request
        data = json.loads(request.body)
        print(request.body)

        # transforms JSON into python object
        # please read serializers.py Items serializer
        item_serializer = ItemSerializer(data=data["item"])
        print(item_serializer.is_valid())

        if item_serializer.is_valid():
            # Serializer class has a built in function that creates an object attributed to it
            # I pass the validated data and it creates the object
            item = item_serializer.create(validated_data=item_serializer.validated_data)
            item_movement = ItemMovement(item=item, type='B', quantity=item.quantity,
                                         vendor=data["item_movement"]["vendor"],
                                         unit_price=data["item_movement"]["unit_price"])
            item_movement.save()
            return Response(data={
                'item_name': item.name
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": item_serializer.errors
            })

    @staticmethod
    def delete(request, pk):
        # audit trail add info on who deleted the item
        Item.objects.get(id=pk).hard_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def put(request, pk):
        # write edit functionality
        item = Item.objects.get(id=pk)
        item_serializer = ItemSerializer(item, data=request.data, partial=True)
        if item_serializer.is_valid():
            item_serializer.save()
            return Response(data={
                'message': item.name
            })
        return Response(item_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuantityRestock(APIView):
    @staticmethod
    def get(request, pk):
        item = Item.objects.get(id=pk)
        item_movements = MovementSerializer(ItemMovement.objects.all()
                                            .filter(item=item)
                                            .order_by('-created'), many=True)
        return Response(data={
            'movements': item_movements.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def put(request, pk):
        quants = json.loads(request.body)
        item = Item.objects.get(id=pk)
        average = quants['unit_price'] + item.average_price
        item.average_price = average / 2
        item.quantity = quants['new_quantity']
        item_movement = ItemMovement(item=Item.objects.get(id=item.id), type='B', quantity=quants['added_quantity'],
                                     unit_price=quants['unit_price'], vendor=quants['vendor'])
        item.save()
        item_movement.save()
        return Response(data={
            'message': item.name
        }, status=status.HTTP_200_OK)


class ShuttlesView(APIView):
    @staticmethod
    def get(request):
        shuttles = ShuttlesSerializer(Shuttle.objects.all(), many=True)
        return Response(data={
            "shuttles": shuttles.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)

        shuttle_serializer = ShuttlesSerializer(data=data)

        if shuttle_serializer.is_valid():
            shuttle = shuttle_serializer.create(validated_data=shuttle_serializer.validated_data)

            return Response(data={
                'shuttle_id': shuttle.id
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                'errors': shuttle_serializer.errors
            })

    @staticmethod
    def delete(request, pk):
        Shuttle.objects.get(id=pk).hard_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RepairProblems(APIView):
    @staticmethod
    def get(request, pk):
        shuttle = Shuttle.objects.get(id=pk)

        repairs = RepairSerializer(Repair.objects.all()
                                        .filter(shuttle=shuttle)
                                        .order_by("-date_requested"), many=True)
        return Response(data={
            "repairs": repairs.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, pk):
        data = json.loads(request.body)
        shuttle = Shuttle.objects.get(id=pk)

        repair = Repair(shuttle=shuttle, date_requested=data['date_reported'],
                        status='NS')
        repair.save()
        for problem in data['problems']:
            rp = RepairProblem(description=problem)
            rp.save()
            repair.problems.add(rp)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ProblemsView(APIView):
    @staticmethod
    def get(request, pk):
        repair = Repair.objects.get(id=pk)
        problems = RepairProblemSerializer(repair.problems.all(), many=True)
        findings = RepairFindingSerializer(repair.findings.all(), many=True)
        modifications = RepairModificationsSerializer(repair.modifications.all(), many=True)

        return Response(data={
            'problems': problems.data,
            'findings': findings.data,
            'modifications': modifications.data,
        }, status=status.HTTP_200_OK)


class MechanicRepairs(APIView):
    @staticmethod
    def get(request):
        repairs = RepairSerializer(Repair.objects.all()
                                        .exclude(status='C')
                                        .order_by('-date_requested'), many=True)

        return Response(data={
            'repairs': repairs.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, pk):
        repair = Repair.objects.get(id=pk)
        data = json.loads(request.body)
        for finding in data['findings']:
            rf = RepairFinding(description=finding)
            rf.save()
            repair.findings.add(rf)

        findings = RepairFindingSerializer(repair.findings.all(), many=True)
        return Response(data={
            'findings': findings.data,
        }, status=status.HTTP_200_OK)
