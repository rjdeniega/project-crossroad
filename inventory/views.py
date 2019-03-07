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
from members.serializers import *

from .models import *
from core.models import Notification


class SpecificItemView(APIView):
    @staticmethod
    def get(request, pk):
        item = ItemSerializer(Item.objects.get(id=pk))
        return Response(data={
            'item': item.data
        }, status=status.HTTP_200_OK)


class ItemAndMovement(APIView):
    @staticmethod
    def get(request):
        data = {
            "items": [],
        }
        for item in Item.objects.all():
            data["items"].append(ItemSerializer(item))
            data["movement_count"] = sum([item for item in ItemMovement.objects.all() if item.item == item])

        return Response(data={
            "items": data,
            "date": datetime.now()
        }, status=status.HTTP_200_OK)


class ItemView(APIView):
    @staticmethod
    def get(request):
        # transform django objects to JSON (so it can be interpreted in the front-end_
        items = ItemSerializer(Item.objects.all(), many=True)
        vendors = {}
        for item in Item.objects.all():
            vendor = Vendor.objects.get(id=item.vendor_id)
            vendors[item.id] = vendor.name
        # returns all item objects
        return Response(data={
            "items": items.data,
            "date": datetime.now().date(),
            "vendors": vendors,
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
                                             'unit_price'),
                                         receipt=receipt,
                                         created=datetime.now().date())
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
                                     unit_price=quants['unit_price'], vendor=quants['vendor'],
                                     created=datetime.now().date())
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
            shuttle.save()
            return Response(data={
                'shuttle_number': shuttle.shuttle_number
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
        message = 'Shuttle ' + str(pk) + ' is has undergone maintenance'
        notification = Notification(type='N', description=message)
        notification.save()
        repair = Repair(shuttle=shuttle, date_requested=data['date_reported'],
                        status='IP')
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

        items = ItemSerializer(Item.objects.all()
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

        send_repair = RepairSerializer(repair)
        return Response(data={
            'repair': send_repair.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, pk):
        repair = Repair.objects.get(id=pk)
        data = json.loads(request.body)

        item = Item.objects.get(id=data['selectedItem'])
        if item.consumable:
            rm = RepairModifications(
                item_used=item, quantity=1, used_up=data['depleted'])
            rm.save()
            repair.modifications.add(rm)
            if rm.used_up:
                im = ItemMovement(item=item, type='G',
                                  quantity=1, repair=repair, created=datetime.now().date())
                im.save()
                item.quantity = item.quantity - 1

        else:
            rm = RepairModifications(
                item_used=item, quantity=data['quantity'], used_up=True)
            rm.save()
            repair.modifications.add(rm)
            im = ItemMovement(item=item, type='G',
                              quantity=data['quantity'], repair=repair, created=datetime.now().date())
            im.save()
            item.quantity = item.quantity - data['quantity']

        item.save()

        if item.quantity < 5:
            notification = Notification(
                type='I', description=item.name + " is low on stock")
            notification.save()
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
            if (repair.labor_fee):
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
            ip = Repair.objects.filter(shuttle=pk).filter(
                maintenance=True).latest('id')
            print(ip.status)
            if ip.status == "IP":
                print("nice")
                return Response(data={
                    'days': "",
                    'date': "",
                    'previous': "",
                    'ip': ip.status
                }, status=status.HTTP_200_OK)
            else:
                repair_date = Repair.objects.filter(shuttle=pk).filter(
                    maintenance=True).latest('id')

                days = repair_date.end_date - datetime.now().date()
                date = repair_date.end_date + relativedelta(months=+3)
                return Response(data={
                    'days': days.days,
                    'date': date,
                    'previous': repair_date,
                    'ip': "",
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
                'previous': '',
                'ip': '',
            }, status=status.HTTP_200_OK)


class StartMaintenance(APIView):
    @staticmethod
    def post(request, pk):
        shuttle = Shuttle.objects.get(id=pk)
        shuttle.status = "UM"
        shuttle.save()
        message = 'Shuttle ' + str(pk) + ' is has undergone maintenance'
        notification = Notification(
            type='N', description=message)
        notification.save()
        repair = Repair(shuttle=shuttle, date_requested=datetime.now(),
                        status='IP', maintenance=True)
        repair.save()
        rp = RepairProblem(description="Preventive Maintenance")
        rp.save()
        repair.problems.add(rp)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ShuttleMaintenanceFrequency(APIView):
    @staticmethod
    def get(request):
        rows = []

        shuttles = Shuttle.objects.all()

        for shuttle in shuttles:
            maintenanceTimes = Repair.objects.filter(shuttle=shuttle.id).filter(status="C").count()
            maintenanceCost = 0

            for repair in Repair.objects.all().filter(shuttle=shuttle.id):
                if repair.labor_fee:
                    maintenanceCost = maintenanceCost + repair.labor_fee

                for item in OutSourcedItems.objects.all().filter(repair=repair.id):
                    maintenanceCost = maintenanceCost + (item.unit_price * item.quantity)

                for item_used in RepairModifications.objects.all().filter(repair=repair.id):
                    print(item_used.pk)
                    print(Item.objects.all())
                    try:
                        item = Item.objects.get(pk=item_used.pk)
                    except ObjectDoesNotExist:
                        print(item_used.id)
                    maintenanceCost = maintenanceCost + (item_used.quantity * item.average_price)

            rows.append({
                "shuttle": shuttle.id,
                "year_purchased": shuttle.date_acquired,
                "number_of_maintenance": maintenanceTimes,
                "mileage": shuttle.mileage,
                "maintenance_cost": "{0:,.2f}".format(maintenanceCost),
                "maintenance_cost_value": maintenanceCost,
                "average_cost_value": (maintenanceCost / maintenanceTimes) if maintenanceTimes > 0 else 0,
                "average_cost": "{0:,.2f}".format(maintenanceCost / maintenanceTimes) if maintenanceTimes > 0 else 0
            })

        total_maintenance_cost = "{0:,.2f}".format(sum([item['maintenance_cost_value'] for item in rows]))
        total_average_maintenance_cost = "{0:,.2f}".format(
            sum([item['average_cost_value'] for item in rows]) / len(rows))

        return Response(data={
            "rows": rows,
            "total_maintenance_cost": total_maintenance_cost,
            "total_average_maintenance_cost": total_average_maintenance_cost,
        }, status=status.HTTP_200_OK)


class ItemMovementReport(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        end_date = datetime.strptime(data["end_date"], '%Y-%m-%d')

        rows = []

        itemMovement = ItemMovement.objects.filter(created__gte=start_date, created__lte=end_date)

        for movement in itemMovement:
            type = ""
            if movement.type == 'B':
                type = 'Purchased from ' + movement.vendor
            else:
                type = 'Used in repairing shuttle ' + str(movement.repair.shuttle.id)
            rows.append({
                "date": movement.created.date(),
                "item": movement.item.name,
                "type": type,
                "quantity": movement.quantity
            })

        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "rows": rows
        }, status=status.HTTP_200_OK)


class ShuttleDayOff(APIView):
    @staticmethod
    def get(request):
        data = list()

        x = 0
        while x <= 6:
            if x is 0:
                day = 'Monday'
            elif x is 1:
                day = 'Tuesday'
            elif x is 2:
                day = 'Wednesday'
            elif x is 3:
                day = 'Thursday'
            elif x is 4:
                day = 'Friday'
            elif x is 5:
                day = 'Saturday'
            elif x is 6:
                day = 'Sunday'

            shuttles = []
            for shuttle in Shuttle.objects.filter(dayoff_date=day):
                shuttles.append({
                    "id": shuttle.id,
                    "number": shuttle.shuttle_number,
                    "plate_number": shuttle.plate_number,
                    "route": shuttle.route,
                })

            data.append(shuttles)

            x += 1

        return Response(data={
            "day_offs": data
        }, status=status.HTTP_200_OK)


class PurchaseOrderView(APIView):
    @staticmethod
    def get(request):
        purchase_orders = PurchaseOrderSerializer(PurchaseOrder.objects.all(), many=True)
        return Response(data={
            "purchase_orders": purchase_orders.data,
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        if not Vendor.objects.filter(name=data['vendor_name']).exists():
            vendor = Vendor(name=data['vendor_name'], address=data['vendor_address'],
                            contact_number=data['vendor_contact'])
            vendor.save()
        else:
            vendor = Vendor.objects.get(name=data['vendor_name'])

        purchase_order = PurchaseOrder(po_number=data["po_num"], vendor=vendor, order_date=datetime.now(),
                                       special_instruction=data["special_instruction"], status="Processing")

        purchase_order.save()

        for item in data['items']:
            category = ItemCategory.objects.get(category=item['category'])
            purchase_order_item = PurchaseOrderItem(quantity=item['quantity'], description=item['description'],
                                                    unit_price=item['unit_price'], category=category,
                                                    item_type=item['item_type'], measurement=item['measurement'],
                                                    unit=item["unit"], brand=item["brand"])
            purchase_order_item.save()
            purchase_order.po_items.add(purchase_order_item)

        return Response(data={
            'something': "wah",
        }, status=status.HTTP_200_OK)


class PurchaseOrderSpecific(APIView):
    @staticmethod
    def get(request, pk):
        purchase_order = PurchaseOrder.objects.get(id=pk)
        purchase_order_details = PurchaseOrderSerializer(purchase_order)
        items = PurchaseOrderItemSerializer(purchase_order.po_items.all(), many=True)
        categories = {}
        for item in purchase_order.po_items.all():
            category = ItemCategory.objects.get(id=item.category.id)
            categories[item.id] = category.category
        vendor = VendorSerializer(Vendor.objects.get(id=purchase_order.vendor.id))
        return Response(data={
            'purchase_order': purchase_order_details.data,
            'items': items.data,
            'vendor': vendor.data,
            'categories': categories
        }, status=status.HTTP_200_OK)

    @staticmethod
    def put(request, pk):
        purchase_order = PurchaseOrder.objects.get(id=pk)
        if request.FILES.get('receipt'):
            purchase_order.receipt = request.FILES['receipt']
        else:
            purchase_order.receipt = None
        purchase_order.save()
        return Response(data={
            'foo': 'bar'
        }, status=status.HTTP_200_OK)


class VendorsView(APIView):
    @staticmethod
    def get(request):
        vendors = VendorSerializer(Vendor.objects.all(), many=True)
        return Response(data={
            'vendors': vendors.data,
        }, status=status.HTTP_200_OK)


class VendorSpecific(APIView):
    @staticmethod
    def get(request, pk):
        vendor = VendorSerializer(Vendor.objects.get(id=pk))
        return Response(data={
            'vendor': vendor.data
        })


class UpdatePurchaseOrder(APIView):
    @staticmethod
    def post(request, pk):
        data = json.loads(request.body)
        purchase_order = PurchaseOrder.objects.get(id=pk)
        if data['update'] == "reject":
            purchase_order.status = "Cancelled"
            purchase_order.save()
            return Response(data={
                'foo': 'bar'
            }, status=status.HTTP_200_OK)
        else:
            purchase_order.status = "Complete"
            purchase_order.completion_date = datetime.now()
            purchase_order.save()
            return Response(data={
                'foo': 'bar'
            }, status=status.HTTP_200_OK)


class GetPurchaseOrderItems(APIView):
    @staticmethod
    def get(request, pk):
        purchase_order = PurchaseOrder.objects.get(id=pk)
        items = ItemSerializer(Item.objects.all()
                               .filter(purchase_order=purchase_order), many=True)
        categories = {}
        for item in Item.objects.all().filter(purchase_order=purchase_order):
            category = ItemCategory.objects.get(id=item.category.id)
            categories[item.id] = category.category
        return Response(data={
            'items': items.data,
            'categories': categories
        }, status=status.HTTP_200_OK)


class ItemCategoryView(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        item_category = ItemCategory(category=data['category'], code_prefix=data['code_prefix'], quantity=0)
        item_category.save()
        return Response(data={
            'success': 'success'
        }, status=status.HTTP_200_OK)

    @staticmethod
    def get(request):
        item_category = ItemCategorySerializer(ItemCategory.objects.all(), many=True)
        return Response(data={
            'item_category': item_category.data
        }, status=status.HTTP_200_OK)


class PurchaseOrderItemView(APIView):
    @staticmethod
    def put(request, pk, po):
        item = PurchaseOrderItem.objects.get(id=pk)
        purchase_order = PurchaseOrder.objects.get(id=po)
        item.received = True
        item.delivery_date = datetime.now()
        item.save()
        purchase_order.status = "Partially Delivered"
        purchase_order.save()
        category = ItemCategory.objects.get(id=item.category.id)
        category.quantity = category.quantity + item.quantity
        category.save()
        vendor = Vendor.objects.get(id=purchase_order.vendor.id)
        code = Item.objects.filter(category=category).count() + 1
        string_code = "{0:0=3d}".format(code)
        item_code = category.code_prefix + string_code
        added_item = Item(description=item.description, quantity=item.quantity, category=category,
                          unit_price=item.unit_price, item_type=item.item_type, measurement=item.measurement,
                          unit=item.unit, brand=item.brand, vendor=vendor, created=datetime.now(),
                          delivery_date=datetime.now(), purchase_order=purchase_order, item_code=item_code, current_measurement=item.measurement)
        added_item.save()
        item_movement = ItemMovement(item=added_item, type="B", quantity=item.quantity, unit_price=item.unit_price)
        item_movement.save()
        return Response(data={
            'foo': added_item.description
        }, status=status.HTTP_200_OK)


class DriverRepairRequest(APIView):
    @staticmethod
    def get(request, pk):
        user = User.objects.get(id=pk)
        active_schedule = Schedule.objects.filter(start_date__lte=datetime.now().date(),
                                                  end_date__gte=datetime.now().date()).first()
        logged_driver = Driver.objects.get(user=user)

        repairs = RepairSerializer(Repair.objects.filter(driver_requested=logged_driver), many=True)
        for shift in Shift.objects.filter(schedule=active_schedule):
            for driver in DriversAssigned.objects.filter(shift=shift):
                if driver.driver == logged_driver:
                    shuttle = driver.shuttle
                    serialized_shuttle = ShuttlesSerializer(shuttle)
                    return Response(data={
                        'shuttle': serialized_shuttle.data,
                        'repairs': repairs.data
                    }, status=status.HTTP_200_OK)

        return Response(data={
            'foo': "There is no assigned shift for this driver",
            'repairs': repairs.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, pk):
        user = User.objects.get(id=pk)
        data = json.loads(request.body)
        active_schedule = Schedule.objects.filter(start_date__lte=datetime.now().date(),
                                                  end_date__gte=datetime.now().date()).first()

        logged_driver = Driver.objects.get(user=user)
        for shift in Shift.objects.filter(schedule=active_schedule):
            for driver in DriversAssigned.objects.filter(shift=shift):
                if driver.driver == logged_driver:
                    message = 'Repair request has been sent'
                    repair = Repair(shuttle=driver.shuttle, date_requested=datetime.now().date(),
                                    status='FI', driver_requested=logged_driver)
                    repair.save()
                    for problem in data['problems']:
                        rp = RepairProblem(description=problem)
                        rp.save()
                        repair.problems.add(rp)
                    return Response(data={
                        'foo': message
                    }, status=status.HTTP_200_OK)

        return Response(data={
            'foo': "There is no assigned shift for this driver"
        }, status=status.HTTP_200_OK)


class UpdateRepairStatus(APIView):
    @staticmethod
    def put(request, pk):
        data = json.loads(request.body)
        repair = Repair.objects.get(id=pk)
        repair.status = data['status']
        if data['type'] == "Minor":
            repair.schedule = datetime.strptime(data['schedule'], '%Y-%m-%d').date()
            
        repair.save()
        repair = RepairSerializer(repair)
        return Response(data={
            'repair': repair.data
        }, status=status.HTTP_200_OK)
