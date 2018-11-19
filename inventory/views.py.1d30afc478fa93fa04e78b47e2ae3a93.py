import json
from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.shortcuts import render
from rest_framework import status
# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.serializers import *
from remittances.models import *

from .models import *


class SpecificItemView(APIView):
    @staticmethod
    def get(request, pk):
        item = ItemSerializer(Item.objects.get(id=pk))
        return Response(data={
            'item': item.data
        }, status=status.HTTP_200_OK)


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
        receipt = request.FILES.get('receipt')
        itemData = {
            "name": request.POST.get('name'),
            "description": request.POST.get('description'),
            "brand": request.POST.get('brand'),
            "quantity": request.POST.get('quantity'),
            "average_price": request.POST.get('average_price'),
            "consumable": request.POST.get('consumable'),
        }
        print(receipt)
        print(itemData)
        # transforms JSON into python object
        # please read serializers.py Items serializer
        item_serializer = ItemSerializer(data=itemData)
        print(item_serializer.is_valid())

        if item_serializer.is_valid():
            # Serializer class has a built in function that creates an object attributed to it
            # I pass the validated data and it creates the object
            item = item_serializer.create(
                validated_data=item_serializer.validated_data)
            item_movement = ItemMovement(item=item, type='B', quantity=item.quantity,
                                         vendor=request.POST.get('vendor'),
                                         unit_price=request.POST.get(
                                             'unite_price'),
                                         receipt=receipt)
            item_movement.save()
            return Response(data={
                "item_name": item.name
            }, status=200)
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
            shuttle = shuttle_serializer.create(
                validated_data=shuttle_serializer.validated_data)

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
        shuttle.status = "UM"
        shuttle.save()
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
        modifications = RepairModificationsSerializer(
            repair.modifications.all(), many=True)
        outsourcedItems = OutsourcedItemsSerializer(
            repair.outsourced_items.all(), many=True)

        return Response(data={
            'problems': problems.data,
            'findings': findings.data,
            'modifications': modifications.data,
            'outsourcedItems': outsourcedItems.data
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


class MechanicItems(APIView):
    @staticmethod
    def get(request, consume):
        consumable = True
        if(consume == 1):
            consumable = False

        items = ItemSerializer(Item.objects.all()
                               .filter(consumable=consumable)
                               .filter(quantity__gte=0), many=True)

        return Response(data={
            'items': items.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def put(request, pk):
        repair = Repair.objects.get(id=pk)
        data = json.loads(request.body)

        shuttle = Shuttle.objects.get(id=repair.shuttle.id)
        shuttle.status = "A"
        shuttle.save()
        if data['action'] == 'complete':
            repair.status = 'C'
            repair.end_date = datetime.now().date()
            repair.save()
        else:
            repair.status = 'IP'
            repair.save()

        sendRepair = RepairSerializer(repair)
        return Response(data={
            'repair': sendRepair.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, pk):
        repair = Repair.objects.get(id=pk)
        data = json.loads(request.body)

        item = Item.objects.get(id=data['selectedItem'])
        if(item.consumable == True):
            rm = RepairModifications(
                item_used=item, quantity=1, used_up=data['depleted'])
            rm.save()
            repair.modifications.add(rm)
            if(rm.used_up == True):
                im = ItemMovement(item=item, type='G',
                                  quantity=1, repair=repair)
                im.save()
                item.quantity = item.quantity - 1

        else:
            rm = RepairModifications(
                item_used=item, quantity=data['quantity'], used_up=True)
            rm.save()
            repair.modifications.add(rm)
            im = ItemMovement(item=item, type='G',
                              quantity=data['quantity'], repair=repair)
            im.save()
            item.quantity = item.quantity - data['quantity']

        item.save()
        modifications = RepairModificationsSerializer(
            repair.modifications.all(), many=True)
        return Response(data={
            'modifications': modifications.data
        }, status=status.HTTP_200_OK)


class OutsourceModification(APIView):
    @staticmethod
    def post(request, pk):
        repair = Repair.objects.get(id=pk)
        data = json.loads(request.body)
        repair.labor_fee = data['labor_cost']
        repair.status = 'C'
        for item in data['items']:
            oi = OutSourcedItems(
                item=item['item_name'], quantity=item['quantity'], unit_price=item['unit_price'])
            oi.save()
            repair.outsourced_items.add(oi)

        repair.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MaintenanceReport(APIView):
    @staticmethod
    def get(request, pk):
        shuttle = Shuttle.objects.get(id=pk)
        initialMaintenanceCost = 0
        repairs = Repair.objects.all().filter(shuttle=shuttle)

        shuttle_remittance = sum([item.total for item in RemittanceForm.objects.filter(
            deployment__shift_iteration__shift__drivers_assigned__shuttle=shuttle.id)])
        print(shuttle_remittance)

        for repair in repairs:
            if(repair.labor_fee):
                initialMaintenanceCost = initialMaintenanceCost + repair.labor_fee

            for modification in repair.modifications.all():
                item = Item.objects.get(id=modification.item_used.id)
                amount = item.average_price * modification.quantity
                initialMaintenanceCost = initialMaintenanceCost + amount

            for outsourced in repair.outsourced_items.all():
                amount = outsourced.quantity * outsourced.unit_price
                initialMaintenanceCost = initialMaintenanceCost + amount

        return Response(data={
            'maintenance_cost': initialMaintenanceCost
        }, status=status.HTTP_200_OK)


class MaintenanceSchedule(APIView):
    @staticmethod
    def post(request, pk):
        data = json.loads(request.body)
        shuttle = Shuttle.objects.get(id=pk)
        print(shuttle)
        shuttle.maintenance_sched = data['date']
        print(data['date'])
        shuttle.save()
        print(shuttle.maintenance_sched)
        
        return Response(data={
            'shuttle_id': shuttle.id
        }, status=status.HTTP_200_OK)

    @staticmethod
    def get(request, pk):
        if Repair.objects.filter(shuttle=pk).filter(
            maintenance=True).exists():
            repair_date = Repair.objects.filter(shuttle=pk).filter(
                maintenance=True).latest('end_date')
            days = repair_date - datetime.now().date()
            date = repair_date + relativedelta(months=+3)
            return Response(data={
                'days': days.days,
                'date': date,
                'previous': repair_date
            }, status=status.HTTP_200_OK)
        else:
            shuttle = Shuttle.objects.get(id=pk)
            print(shuttle.maintenance_sched - datetime.now().date())
            days = shuttle.maintenance_sched - datetime.now().date()
            print(days.days)
            print(datetime.now())
            print(datetime.now() + relativedelta(months=+3))
            return Response(data={
                'days': days.days,
                'date': shuttle.maintenance_sched,
                'previous': ''
            }, status=status.HTTP_200_OK)


class StartMaintenance(APIView):
    @staticmethod
    def post(request, pk):
        shuttle = Shuttle.objects.get(id=pk)
        shuttle.status = "UM"
        shuttle.save()
        repair = Repair(shuttle=shuttle, date_requested=data['date_reported'],
                        status='NS')
        repair.save()
        for problem in data['problems']:
            rp = RepairProblem(description=problem)
            rp.save()
            repair.problems.add(rp)

        return Response(status=status.HTTP_204_NO_CONTENT)