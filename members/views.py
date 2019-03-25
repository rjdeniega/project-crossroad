from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from members.serializers import *
from remittances.models import *
from remittances.serializers import BeepTransactionSerializer, DriversAssignedSerializer
from remittances.views import TicketUtilities
from .models import *
import json


class SupervisorView(APIView):
    @staticmethod
    def get(request):
        supervisors = [driver for driver in Driver.objects.all() if driver.is_supervisor]
        serialized_supervisors = SupervisorSerializer(supervisors, many=True)
        return Response(data={
            "supervisors": serialized_supervisors.data
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
        drivers = DriverSerializer(Driver.objects.filter(is_supervisor=False), many=True)
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


class AssignedDriverView(APIView):
    @staticmethod
    def get(request, supervisor_id):
        # transform django objects to JSON (so it can be interpreted in the front-end_
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())

        drivers = DriversAssigned.objects.filter(shift__schedule=active_sched)

        drivers = [item.driver.name for item in drivers]
        drivers.append(Driver.objects.get(id=supervisor_id).name)
        drivers = sorted(drivers)

        new_drivers = []
        for item in drivers:
            x = Driver.objects.filter(name=item)[0]
            new_drivers.append(x)

        drivers = DriverSerializer(new_drivers, many=True).data



        ten_total = 0
        twelve_total = 0
        fifteen_total = 0
        for driver in drivers:
            driver["ten_peso_tickets"] = []
            driver["twelve_peso_tickets"] = []
            driver["fifteen_peso_tickets"] = []
            tickets = TicketUtilities.get_assigned_with_void_of_driver(driver["id"])

            for ticket in tickets:
                if ticket["ticket_type"] == '10 Pesos':
                    ten_total += ticket["range_to"] - ticket["range_from"] + 1
                    driver["ten_peso_tickets"].append(ticket)
                elif ticket["ticket_type"] == '12 Pesos':
                    twelve_total += ticket["range_to"] - ticket["range_from"] + 1
                    driver["twelve_peso_tickets"].append(ticket)
                else:
                    fifteen_total += ticket["range_to"] - ticket["range_from"] + 1
                    driver["fifteen_peso_tickets"].append(ticket)

            driver["ten_total"] = ten_total
            driver["twelve_total"] = twelve_total
            driver["fifteen_total"] = fifteen_total
            driver["has_misssing"] = False if driver['ten_total'] >= 50 or driver['twelve_total'] >= 50 or driver[
                                                                                                            'fifteen_total'] >=80 else True

        return Response(data={
            "drivers": drivers
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


class SpecificMemberView(APIView):
    @staticmethod
    def get(request, member_id):
        member = MemberSerializer(Member.objects.get(id=member_id))
        try:
            id_card = IDCards.objects.filter(member=Member.objects.get(pk=member_id)).last()
        except ObjectDoesNotExist:
            id_card = None

        if id_card is not None:
            card_number = id_card.can
            member.data["card_number"] = card_number
        else:
            card_number = None

        response = member.data
        response["card_number"] = card_number

        return Response(data={
            "member": response
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, member_id):
        # member_data = {
        #     "name": request.POST.get('name'),
        #     "email": request.POST.get('email'),
        #     "sex": request.POST.get('sex'),
        #     "address": request.POST.get('address'),
        #     "contact_no": request.POST.get('contact_no'),
        #     "tin_number": request.POST.get('tin_number'),
        #     "religion": request.POST.get('religion'),
        #     "occupation": request.POST.get('occupation'),
        #     "no_of_dependents": request.POST.get('no_of_dependents'),
        #     "annual_income": request.POST.get('annual_income'),
        #     "civil_status": request.POST.get('civil_status'),
        #     "educational_attainment": request.POST.get('civil_status'),
        # }
        data = json.loads(request.body)
        member_data = {
            "name": data['name'],
            "email": data['email'],
            "sex": data['sex'],
            "address": data['address'],
            "contact_no": data['contact_no'],
            "tin_number": data['tin_number'],
            "religion": data['religion'],
            "occupation": data['occupation'],
            "no_of_dependents": data['no_of_dependents'],
            "annual_income": data['annual_income'],
            "civil_status": data['civil_status'],
            "educational_attainment": data['educational_attainment'],
        }
        print(member_data)
        member = Member.objects.get(pk=member_id)
        member.name = member_data["name"]
        member.email = member_data["email"]
        member.sex = member_data["sex"]
        member.address = member_data["address"]
        member.contact_no = member_data["contact_no"]
        member.tin_number = member_data["tin_number"]
        member.religion = member_data["religion"]
        member.occupation = member_data["occupation"]
        member.no_of_dependents = member_data["no_of_dependents"]
        member.annual_income = member_data["annual_income"]
        member.civil_status = member_data["civil_status"]
        member.educational_attainment = member_data["educational_attainment"]
        member.save()

        return Response(data={
            "member": MemberSerializer(member).data
        }, status=status.HTTP_200_OK)


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
        id_cards = IDCards.objects.filter(member=Member.objects.get(pk=member_id))
        transactions = []
        transactions_list = []
        for id in id_cards:
            transactions = BeepTransaction.objects.filter(card_number=id.can)
            transactions_list.append(transactions)

        serialized_transactions = BeepTransactionSerializer(transactions, many=True)
        for item in serialized_transactions.data:
            item["shift_date"] = BeepShift.objects.get(pk=item["shift"]).date
            item["total"] = "{0:,.2f}".format(float(item["total"]))
        return Response(data={
            "transactions": serialized_transactions.data,
            "total_transactions": sum([float(item["total"]) for item in serialized_transactions.data])
        }, status=status.HTTP_200_OK)


class MemberSharesView(APIView):
    @staticmethod
    def get(request, member_id):
        shares = Share.objects.filter(member=Member.objects.get(pk=member_id)).order_by("date_of_update")
        serialized_shares = ShareSerializer(shares, many=True)

        for item in serialized_shares.data:
            item["peso_value"] = float(item["value"]) * 500

        return Response(data={
            "shares": reversed(serialized_shares.data),
            "total_shares": sum([float(item["value"]) for item in serialized_shares.data]),
            "total_peso_value": sum([float(item["peso_value"]) for item in serialized_shares.data])
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, member_id):
        share = None

        total_value = Share.objects.all().aggregate(Sum('value'))
        total_value = int(total_value['value__sum'])
        value = int(request.POST.get('value'))
        action = request.POST.get('action')
        print(action)

        if action == "withraw":
            if value > total_value:
                return Response(data={
                    "error": "Not enough shares to be withrawn"
                }, status=400)
            value = -value

        data = {
            "member": Member.objects.get(pk=member_id),
            "date_of_update": request.POST.get('date'),
            "receipt": request.POST.get('receipt'),
            "value": value,
        }
        # "photo": request.FILES.get('image')

        if data['date_of_update'] == "now":
            data['date_of_update'] = datetime.now().date()
        print(data['date_of_update'])
        share_serializer = ShareSerializer(data=data)

        if share_serializer.is_valid():
            share = share_serializer.create(validated_data=share_serializer.validated_data)
        else:
            return Response(data={
                "errors": share_serializer.errors
            }, status=400)

        return Response(data={
            "share": ShareSerializer(share).data,
        }, status=status.HTTP_200_OK)


class IDCardView(APIView):
    @staticmethod
    def get(request, member_id):
        print("etners here")
        id_cards = IDCardsSerializer(IDCards.objects.filter(member=Member.objects.get(pk=member_id)), many=True)

        for item in id_cards.data:
            x = [y for y in BeepTransaction.objects.all() if y.card_number == item['can']]
            item['transactions'] = len(x)
        return Response(data={
            "cards": id_cards.data,
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, member_id):
        body = json.loads(request.body)
        print(request)
        print(body)
        data = {
            "member": Member.objects.get(pk=member_id),
            "can": body["can"],
            "register_date": body["register_date"],
        }
        card_serializer = IDCardSerializer(data=data)

        if card_serializer.is_valid():
            card = card_serializer.create(validated_data=card_serializer.validated_data)
        else:
            return Response(data={
                "errors": card_serializer.errors
            }, status=400)

        return Response(data={
            "card": IDCardSerializer(card).data,
        }, status=status.HTTP_200_OK)
