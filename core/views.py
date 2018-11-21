import calendar
import json
from datetime import datetime, timedelta

import rest_framework
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.core import serializers
from django.db.models import Q
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views import View
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Notification
# Create your views here.
from core.serializers import (NotificationSerializer, PersonSerializer,
                              UserSerializer)
from members.models import *
from members.models import Clerk, Driver, OperationsManager, Person, Supervisor
from members.serializers import (ClerkSerializer, DriverSerializer,
                                 MechanicSerializer, MemberSerializer,
                                 OperationsManagerSerializer, ShareSerializer,
                                 SupervisorSerializer)
from remittances.models import *
from remittances.serializers import (BeepTransactionSerializer,
                                     CarwashTransactionSerializer)
from remittances.views import IterationUtilites


class SignInView(APIView):
    @staticmethod
    def post(request):
        if "username" not in request.data or "password" not in request.data:
            return Response(data={
                "error": "Missing username or password"
            }, status=400)
        username = request.data["username"]
        password = request.data["password"]
        user = authenticate(username=username, password=password)
        if user is None:
            return Response(data={
                "error": "Invalid credentials"
            }, status=401)

        if Token.objects.filter(user=user).count() == 1:
            token = Token.objects.get(user=user)
        else:
            token = Token.objects.create(user=user)
        user_type = SignInView.get_user_type(user)
        user_staff = SignInView.get_user_staff(user_type, user)
        request.user = user
        return Response(data={
            "token": token.key,
            "user": model_to_dict(user),
            "user_type": user_type,
            "user_staff": user_staff
        }, status=200)

    @staticmethod
    def get_user_type(user):
        print("enters here")
        if user.is_superuser:
            return "system_admin"
        if user in [driver.user for driver in Driver.objects.all()]:
            return "driver"
        if user in [supervisor.user for supervisor in Supervisor.objects.all()]:
            return "supervisor"
        if user in [operations_manager.user for operations_manager in OperationsManager.objects.all()]:
            return "operations_manager"
        if user in [clerk.user for clerk in Clerk.objects.all()]:
            return "clerk"
        if user in [member.user for member in Member.objects.all()]:
            return "member"
        if user in [mechanic.user for mechanic in Mechanic.objects.all()]:
            return "mechanic"

    @staticmethod
    def get_user_staff(user_type, user):
        if user_type == "system_admin":
            return model_to_dict(user)
        if user_type == "driver":
            return DriverSerializer(Driver.objects.get(user=user)).data
        if user_type == "supervisor":
            return SupervisorSerializer(Supervisor.objects.get(user=user)).data
        if user_type == "operations_manager":
            return OperationsManagerSerializer(OperationsManager.objects.get(user=user)).data
        if user_type == "clerk":
            return ClerkSerializer(Clerk.objects.get(user=user)).data
        if user_type == "member":
            return MemberSerializer(Member.objects.get(user=user)).data
        if user_type == "mechanic":
            return MechanicSerializer(Mechanic.objects.get(user=user)).data


class CreateUserView(APIView):
    @staticmethod
    def get(request):
        users = User.objects.all()
        # returns all item objects
        data = serializers.serialize('json', users)
        return Response(data={
            "users": data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        print(request.data)
        if "username" not in request.data or "password" not in request.data:
            return Response(data={
                "error": "Missing username,password, or user type"
            }, status=400, content_type="application/json")
        user = User()
        user.username = request.POST.get('username')
        user.set_password(request.POST.get('password'))
        user.save()
        user_type = request.POST.get('user_type')
        print("entered this shit")
        print(request.POST.get('application_date'))
        print(request.POST.get('birth_date'))
        data = {
            "user": user,
            "name": request.POST.get('name'),
            "email": request.POST.get('email'),
            "sex": request.POST.get('sex'),
            "address": request.POST.get('address'),
            "contact_no": request.POST.get('contact_no'),
            "birth_date": request.POST.get('birth_date'),
            "application_date": request.POST.get('application_date'),
            "photo": request.FILES.get('image')
        }
        member_data = {
            "user": user,
            "name": request.POST.get('name'),
            "email": request.POST.get('email'),
            "sex": request.POST.get('sex'),
            "address": request.POST.get('address'),
            "contact_no": request.POST.get('contact_no'),
            "birth_date": request.POST.get('birth_date'),
            "accepted_date": request.POST.get('accepted_date'),
            "card_number": request.POST.get('card_number'),
            "tin_number": request.POST.get('tin_number'),
            "religion": request.POST.get('religion'),
            "occupation": request.POST.get('occupation'),
            "no_of_dependents": request.POST.get('no_of_dependents'),
            "annual_income": request.POST.get('annual_income'),
            "civil_status": request.POST.get('civil_status'),
            "educational_attainment": request.POST.get('civil_status'),
            "photo": request.FILES.get('image'),
            "initial_share": request.POST.get('initial_share'),
            "buy_in_date": request.POST.get('buy_in_date'),
            "receipt": request.POST.get('receipt'),
        }
        staff_data = data if user_type != "Member" else member_data
        user_staff = CreateUserView.create_user_type(user, user_type, staff_data)
        print(model_to_dict(user_staff))
        # user_staff.photo = Image.open(photo)
        # user_staff.save()
        new_user = UserSerializer(user)
        instance = CreateUserView.get_serialized_data(user_type, user_staff)
        return Response(data={
            "user_staff": instance.data,
            "user": new_user.data,
        }, status=200, content_type="application/json")

    @staticmethod
    def create_user_type(user, user_type, data):
        if user_type == "Driver":
            return Driver.objects.create(**data)
        if user_type == "Clerk":
            return Clerk.objects.create(**data)
        if user_type == "OM":
            return OperationsManager.objects.create(**data)
        if user_type == "Supervisor":
            return Supervisor.objects.create(**data)
        if user_type == "Member":
            card_number = data.pop('card_number')
            share_value = data.pop('initial_share')
            date = data.pop('buy_in_date')
            receipt = data.pop('receipt')
            member = Member.objects.create(**data)
            id_card = IDCards()
            id_card.member = member
            id_card.register_date = datetime.now().date()
            id_card.can = card_number
            id_card.save()
            share = Share()
            share.member = member
            share.date_of_update = date
            share.value = share_value
            share.receipt = f"buy-in share {receipt}"
            share.save()

            return member
        if user_type == "Mechanic":
            return Mechanic.objects.create(**data)

    @staticmethod
    def get_serialized_data(user_type, user_staff):
        if user_type == "Driver":
            return DriverSerializer(user_staff)
        if user_type == "Clerk":
            return ClerkSerializer(user_staff)
        if user_type == "OM":
            return OperationsManagerSerializer(user_staff)
        if user_type == "Supervisor":
            return SupervisorSerializer(user_staff)
        if user_type == "Member":
            return MemberSerializer(user_staff)
        if user_type == "Mechanic":
            return MechanicSerializer(user_staff)


class CreateDefaultUserView(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)

        # transform JSON into python object
        # please read serializers.py Person and Driver serializer
        user_serializer = UserSerializer(data=data)

        if user_serializer.is_valid():
            # Serializer class has a built in function that creates
            #  an object attributed to it
            # I pass the validated data and it creates the object
            user = user_serializer.create(validated_data=
                                          user_serializer.validated_data)
            return Response(data={
                'user_name': user.username,
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": user_serializer.errors
            })


class UserHandler(APIView):
    @staticmethod
    def post(request):
        # check if username is taken
        print("enters here")
        print(request.data)
        if request.data["user_type"] == "Please select user type":
            return Response(data={
                "error": "No selected user type"
            }, status=400)
        if "username" not in request.data or "password" not in request.data:
            return Response(data={
                "error": "Missing username, password, or user type"
            }, status=400)
        username = request.data["username"]
        existing_usernames = [user.username for user in User.objects.all()]

        if username in existing_usernames:
            print(existing_usernames)
            return Response(data={
                "error": "Username already taken"
            }, status=400)
        else:
            return Response(data={
                "unique": True
            }, status=400)


class UserView(APIView):
    @staticmethod
    def get(request):
        users = UserSerializer(User.objects.all(), many=True)

        return Response(data={
            "users": users.data
        }, status=status.HTTP_200_OK)


class PersonView(APIView):
    @staticmethod
    def get(request):
        people = PersonSerializer(Person.objects.all(), many=True)

        return Response(data={
            "people": people.data
        }, status=status.HTTP_200_OK)


class StaffView(APIView):
    @staticmethod
    def get(request):
        drivers = DriverSerializer(Driver.objects.all(), many=True)
        managers = OperationsManagerSerializer(OperationsManager.objects.all(), many=True)
        clerks = ClerkSerializer(Clerk.objects.all(), many=True)
        supervisors = SupervisorSerializer(Supervisor.objects.all(), many=True)

        return Response(data={
            "drivers": drivers.data,
            "managers": managers.data,
            "clerks": clerks.data,
            "supervisors": supervisors.data
        }, status=status.HTTP_200_OK)


class RemittanceReport(APIView):
    @staticmethod
    def get(request):
        # data = json.loads(request.body)
        # start_date = data['start_date']
        # end_date = data['end_date']

        # deployments = Deployment.objects.filter(shift_iteration__date__gte=start_date,
        #                                         shift_iteration__date__lte=end_date)
        deployments = Deployment.objects.filter(shift_iteration__status='F')
        report_items = IterationUtilites.get_report_items(deployments)
        # grand_total = RemittanceForm.objects.filter(deployment__shift_iteration__date__gte=start_date,
        #                                             deployment__shift_iteration__date__lte=end_date).aggregate(
        #     Sum('total'))
        grand_total = RemittanceForm.objects.all().aggregate(Sum('total'))

        return Response(data={
            'grand_total': grand_total,
            'report_items': report_items
        }, status=status.HTTP_200_OK)


class SharesReport(APIView):
    @staticmethod
    def get(request):
        report_items = []
        for member in Member.objects.all():
            shares = Share.objects.filter(member=Member.objects.get(pk=member.id))
            serialized_shares = ShareSerializer(shares, many=True)

            for item in serialized_shares.data:
                item["peso_value"] = float(item["value"]) * 500

            id_card = [item for item in IDCards.objects.all() if item.member == member][0]
            member = MemberSerializer(member).data
            member["card_number"] = id_card.can
            print(id_card.can)

            report_items.append({
                "member": member,
                "shares": serialized_shares.data,
                "total_shares": sum([float(item["value"]) for item in serialized_shares.data]),
                "total_peso_value": sum([float(item["peso_value"]) for item in serialized_shares.data])
            })

        return Response(data={
            "report_items": report_items
        }, status=status.HTTP_200_OK)


class TransactionReport(APIView):
    @staticmethod
    def get(request):
        report_items = []
        for member in Member.objects.all():
            try:
                id_card = IDCards.objects.get(member=Member.objects.get(pk=member.id))
            except ObjectDoesNotExist:
                report_items.append({
                    "member": MemberSerializer(member).data,
                    "transactions": None,
                    "total_transactions": 0
                })
                id_card = None

            if id_card is not None:
                member_data = MemberSerializer(member).data
                member_data["card_number"] = id_card.can
                transactions = BeepTransaction.objects.filter(card_number=id_card.can)
                carwash_transactions = [CarwashTransactionSerializer(item).data for item in
                                        CarwashTransaction.objects.all() if item.member == member]
                print(transactions)
                serialized_transactions = [BeepTransactionSerializer(item).data for item in transactions]
                for item in serialized_transactions:
                    item["shift_date"] = BeepShift.objects.get(pk=item["shift"]).date
                report_items.append({
                    "member": member_data,
                    "beep_transactions": serialized_transactions,
                    "carwash_transactions": carwash_transactions,
                    "total_transactions": sum([float(item["total"]) for item in serialized_transactions])
                })
        return Response(data={
            "report_items": report_items
        }, status=status.HTTP_200_OK)


class TransactionByDate(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        if "end_date" in request.data:
            end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
        else:
            end_date = None

        report_items = []
        for member in Member.objects.all():
            member_data = MemberSerializer(member).data
            try:
                id_card = IDCards.objects.get(member=Member.objects.get(pk=member.id))
            except ObjectDoesNotExist:
                report_items.append({
                    "member": MemberSerializer(member).data,
                    "transactions": None,
                    "total_transactions": 0
                })
                id_card = None

            if id_card is not None:
                member_data["id_card"] = id_card.can
                transactions = BeepTransaction.objects.filter(card_number=id_card.can)
                carwash_transactions = [item for item in
                                        CarwashTransaction.objects.all() if item.member == member]
                if end_date is not None:
                    transactions = [item for item in transactions if
                                    start_date.date() <= item.shift.date <= end_date.date()]
                    carwash_transactions = [CarwashTransactionSerializer(item).data for item in carwash_transactions if
                                            start_date.date() <= item.date <= end_date.date()]
                else:

                    transactions = [item for item in transactions if start_date.date() == item.shift.date]
                    carwash_transactions = [CarwashTransactionSerializer(item).data for item in carwash_transactions if
                                            start_date.date() == item.date]

                serialized_transactions = BeepTransactionSerializer(transactions, many=True)
                for item in serialized_transactions.data:
                    item["shift_date"] = BeepShift.objects.get(pk=item["shift"]).date

                report_items.append({
                    "member": member_data,
                    "beep_transactions": serialized_transactions.data,
                    "carwash_transactions": carwash_transactions,
                    "total_transactions": sum([float(item["total"]) for item in serialized_transactions.data])
                })
        return Response(data={
            "report_items": report_items
        }, status=status.HTTP_200_OK)


class SharesByDate(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        if "end_date" in request.data:
            end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
        else:
            end_date = None

        report_items = []
        for member in Member.objects.all():
            shares = Share.objects.filter(member=member)

            if end_date is not None:
                share_updates = [item for item in shares if
                                 start_date.date() <= item.date_of_update <= end_date.date()]
            else:
                share_updates = [item for item in shares if start_date.date() == item.date_of_update]

            serialized_shares = ShareSerializer(share_updates, many=True)
            for item in serialized_shares.data:
                item["peso_value"] = float(item["value"]) * 500

            id_card = [item for item in IDCards.objects.all() if item.member == member][0]
            member = MemberSerializer(member).data
            member["id_card"] = id_card.can
            print(id_card.can)

            report_items.append({
                "member": member,
                "shares": serialized_shares.data,
                "total_shares": sum([float(item["value"]) for item in serialized_shares.data]),
                "total_peso_value": sum([float(item["peso_value"]) for item in serialized_shares.data])
            })

        return Response(data={
            "report_items": report_items
        }, status=status.HTTP_200_OK)


class PassengerCountUtilities():
    @staticmethod
    def count_remittance(shift_type, current_date):
        passenger_count = 0

        for remittance in RemittanceForm.objects.filter(deployment__shift_iteration__date=current_date,
                                                        deployment__shift_iteration__shift__type=shift_type):
            for assigned_ticket in AssignedTicket.objects.filter(deployment__remittanceform=remittance.id):
                consumed_ticket = ConsumedTicket.objects.get(assigned_ticket=assigned_ticket.id)
                print(consumed_ticket.end_ticket)
                print(assigned_ticket.range_from)
                if assigned_ticket.range_from is not None:
                    passenger_count += consumed_ticket.end_ticket - assigned_ticket.range_from + 1

        return passenger_count

    @staticmethod
    def count_beep(shift_type, current_date):
        return len(BeepTransaction.objects.filter(shift__date=current_date, shift__type=shift_type))


class PassengerCount(APIView):
    @staticmethod
    def get(request):
        report_items = []
        dates = [item.shift.date for item in BeepTransaction.objects.all() if item.shift.type == "A"]
        dates = list(set(dates))

        for date in dates:
            am_count = PassengerCountUtilities.count_remittance('A', date)
            pm_count = PassengerCountUtilities.count_remittance('P', date)
            am_beep = PassengerCountUtilities.count_beep('A', date)
            pm_beep = PassengerCountUtilities.count_beep('P', date)
            item = {
                "date": date,
                "day": calendar.day_name[date.weekday()],
                "am_count": am_count,
                "pm_count": pm_count,
                "am_beep": am_beep,
                "pm_beep": pm_beep,
                "am_total": am_count + am_beep,
                "pm_total": pm_count + pm_beep,
                "total": am_count + am_beep + pm_count + pm_beep
            }
            report_items.append(item)
        return Response(data={
            "report_items": report_items,
            "am_total": sum([item["am_total"] for item in report_items]),
            "pm_total": sum([item["pm_total"] for item in report_items])
        }, status=status.HTTP_200_OK)


class PassengerCountByDate(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        if "end_date" in request.data:
            end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
        else:
            end_date = None

        report_items = []

        current_date = start_date
        if end_date is not None:
            dates = [item.shift.date for item in BeepTransaction.objects.all() if item.shift.type == "A"]
            dates = list(set(dates))

            for date in dates:
                print(end_date.date())
                print(date)
                print(start_date.date())
                if start_date.date() <= date <= end_date.date():
                    am_count = PassengerCountUtilities.count_remittance('A', date)
                    pm_count = PassengerCountUtilities.count_remittance('P', date)
                    am_beep = PassengerCountUtilities.count_beep('A', date)
                    pm_beep = PassengerCountUtilities.count_beep('P', date)
                    item = {
                        "date": date,
                        "day": calendar.day_name[date.weekday()],
                        "am_count": am_count,
                        "pm_count": pm_count,
                        "am_beep": am_beep,
                        "pm_beep": pm_beep,
                        "am_total": am_count + am_beep,
                        "pm_total": pm_count + pm_beep,
                        "total": am_count + am_beep + pm_count + pm_beep
                    }
                    report_items.append(item)
        else:
            am_count = PassengerCountUtilities.count_remittance('A', current_date)
            pm_count = PassengerCountUtilities.count_remittance('P', current_date)
            am_beep = PassengerCountUtilities.count_beep('A', current_date)
            pm_beep = PassengerCountUtilities.count_beep('P', current_date)

            report_items.append({
                "date": current_date.date(),
                "day": calendar.day_name[current_date.weekday()],
                "am_count": am_count,
                "pm_count": pm_count,
                "am_beep": am_beep,
                "pm_beep": pm_beep,
                "am_total": am_count + am_beep,
                "pm_total": pm_count + pm_beep,
                "total": am_count + am_beep + pm_count + pm_beep
            })
        print(report_items)
        return Response(data={
            "report_items": report_items,
            "am_total": sum([item["am_total"] for item in report_items]),
            "pm_total": sum([item["pm_total"] for item in report_items])
        }, status=status.HTTP_200_OK)


class RemittanceVersusFuelReport(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        print(request.data)
        if "end_date" in request.data:
            end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
        else:
            end_date = start_date + timedelta(days=6)  # for one week
        temp_start = start_date

        rows = []
        grand_total = 0
        grand_fuel_total = 0

        while temp_start <= end_date:
            shift_iterations = ShiftIteration.objects.filter(date=temp_start)

            shifts = []

            total_remit_day_without_fuel = 0
            total_fuel_for_day = 0

            for shift in shift_iterations:
                remittances = RemittanceForm.objects.filter(deployment__shift_iteration=shift)

                total_remittance = 0
                total_fuel = 0

                for remittance in remittances:
                    total_remittance += (remittance.total + remittance.fuel_cost)
                    total_fuel += remittance.fuel_cost

                if len(shifts) == 1:
                    total_per_day = shifts[0]["remittance"] + total_remittance
                else:
                    total_per_day = total_remittance

                shifts.append({
                    "type": shift.shift.get_type_display(),
                    "remittance": "{0:,.2f}".format(total_remittance),
                    "total_per_day": "{0:,.2f}".format(total_per_day),
                    "fuel": "{0:,.2f}".format(total_fuel),
                    "remittance_minus_fuel": "{0:,.2f}".format(total_remittance - total_fuel)
                })

                total_remit_day_without_fuel += total_remittance
                total_fuel_for_day += total_fuel

            if len(shifts) == 0:
                shifts = [{
                    "type": "AM",
                    "total_per_day": 0,
                    "remittance": 0,
                    "fuel": 0,
                    "remittance_minus_fuel": 0
                }, {
                    "type": "PM",
                    "total_per_day": 0,
                    "remittance": 0,
                    "fuel": 0,
                    "remittance_minus_fuel": 0
                }]
            rows.append({
                "date": temp_start.date(),
                "shifts": shifts,
                "total_remit_day_without_fuel": "{0:,.2f}".format(total_remit_day_without_fuel),
                "total_fuel_for_day": "{0:,.2f}".format(total_fuel_for_day),
                "total_minus_fuel": "{0:,.2f}".format(total_remit_day_without_fuel - total_fuel_for_day)
            })

            # totals
            grand_total += total_remit_day_without_fuel
            grand_fuel_total += total_fuel_for_day

            temp_start = temp_start + timedelta(days=1)

        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "grand_remit_total": "{0:,.2f}".format(grand_total),
            "grand_fuel_total": "{0:,.2f}".format(grand_fuel_total),
            "grand_remit_minus_fuel": "{0:,.2f}".format(grand_total - grand_fuel_total),
            "rows": rows
        }, status=status.HTTP_200_OK)


class TicketCountReport(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        end_date = start_date + timedelta(days=30)  # for one month

        rows = []
        grand_am_total = 0
        grand_pm_total = 0

        shuttles = Shuttle.objects.all()

        for shuttle in shuttles:
            temp_start = start_date
            days = []

            # total count for the month
            am_total = 0
            pm_total = 0

            while temp_start <= end_date:
                deployments = Deployment.objects.filter(shuttle_id=shuttle.id, shift_iteration__date=temp_start)

                # counts for the day
                am_count = 0
                pm_count = 0

                for deployment in deployments:
                    consumed_tickets = ConsumedTicket.objects.filter(remittance_form__deployment=deployment)

                    for consumed_ticket in consumed_tickets:
                        if deployment.shift_iteration.shift.type is 'A':

                            if consumed_ticket.assigned_ticket.type is 'A':
                                print(consumed_ticket.total)
                                am_count += consumed_ticket.total / 10
                            elif consumed_ticket.assigned_ticket.type is 'B':
                                print(consumed_ticket.total)
                                am_count += consumed_ticket.total / 12
                            else:
                                print(consumed_ticket.total)
                                am_count += consumed_ticket.total / 15

                        else:

                            if consumed_ticket.assigned_ticket.type is 'A':
                                print("A")
                                print(consumed_ticket.total)
                                pm_count += consumed_ticket.total / 10
                            elif consumed_ticket.assigned_ticket.type is 'B':
                                print("B")
                                print(consumed_ticket.total)
                                pm_count += consumed_ticket.total / 12
                            else:
                                print("C")
                                print(consumed_ticket.total)
                                pm_count += consumed_ticket.total / 15

                days.append({
                    "date": temp_start,
                    "day": calendar.day_name[temp_start.weekday()],
                    "am_count": am_count,
                    "pm_count": pm_count
                })
                am_total += am_count
                pm_total += pm_count

                temp_start = temp_start + timedelta(days=1)

            rows.append({
                "shuttle_number": shuttle.id,
                "plate_number": shuttle.plate_number,
                "model": shuttle.model,
                "am_total": am_total,
                "pm_total": pm_total,
                "days": days
            })
            grand_am_total = grand_am_total + am_total
            grand_pm_total += grand_pm_total + pm_total

        return Response(data={
            "start_date": start_date,
            "end_date": end_date,
            "grand_am_total": grand_am_total,
            "grand_pm_total": grand_pm_total,
            "am_average": grand_am_total / 30,
            "pm_average": grand_pm_total / 30,
            "grand_total": grand_am_total + grand_pm_total,
            "grand_average": (grand_am_total + grand_pm_total) / 30,
            "shuttles": rows
        }, status=status.HTTP_200_OK)


class TicketTypePerDayReport(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        end_date = start_date + timedelta(days=6)  # for one week

        temp_start = start_date

        days = []
        grand_am_total = 0
        grand_pm_total = 0
        grand_ten_total = 0
        grand_twelve_total = 0
        grand_fifteen_total = 0

        while temp_start <= end_date:
            deployments = Deployment.objects.filter(shift_iteration__date=temp_start)

            # counts for the day
            am_count = 0
            pm_count = 0
            am_ten = 0
            am_twelve = 0
            am_fifteen = 0
            pm_ten = 0
            pm_twelve = 0
            pm_fifteen = 0

            for deployment in deployments:
                consumed_tickets = ConsumedTicket.objects.filter(remittance_form__deployment=deployment)

                for consumed_ticket in consumed_tickets:
                    if deployment.shift_iteration.shift.type is 'A':

                        if consumed_ticket.assigned_ticket.type is 'A':
                            print(consumed_ticket.total)
                            am_count += consumed_ticket.total / 10
                            am_ten += consumed_ticket.total / 10

                        elif consumed_ticket.assigned_ticket.type is 'B':
                            print(consumed_ticket.total)
                            am_count += consumed_ticket.total / 12
                            am_twelve += consumed_ticket.total / 12

                        else:
                            print(consumed_ticket.total)
                            am_count += consumed_ticket.total / 15
                            am_fifteen += consumed_ticket.total / 15

                    else:

                        if consumed_ticket.assigned_ticket.type is 'A':
                            print("A")
                            print(consumed_ticket.total)
                            pm_count += consumed_ticket.total / 10
                            pm_ten += consumed_ticket.total / 10

                        elif consumed_ticket.assigned_ticket.type is 'B':
                            print("B")
                            print(consumed_ticket.total)
                            pm_count += consumed_ticket.total / 12
                            pm_twelve += consumed_ticket.total / 12

                        else:
                            print("C")
                            print(consumed_ticket.total)
                            pm_count += consumed_ticket.total / 15
                            pm_fifteen += consumed_ticket.total / 15

            days.append({
                "date": temp_start.date(),
                "am_total": am_count,
                "pm_total": pm_count,
                "am_ten": am_ten,
                "am_twelve": am_twelve,
                "am_fifteen": am_fifteen,
                "pm_ten": pm_ten,
                "pm_twelve": pm_twelve,
                "pm_fifteen": pm_fifteen
            })

            grand_am_total += am_count
            grand_pm_total += pm_count
            grand_ten_total += am_ten + pm_ten
            grand_twelve_total += am_twelve + pm_twelve
            grand_fifteen_total += am_fifteen + pm_fifteen

            temp_start = temp_start + timedelta(days=1)

        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "grand_total": grand_ten_total + grand_twelve_total + grand_fifteen_total,
            "grand_am_total": grand_am_total,
            "grand_pm_total": grand_pm_total,
            "grand_ten_total": grand_ten_total,
            "grand_twelve_total": grand_twelve_total,
            "grand_fifteen_total": grand_fifteen_total,
            "days": days
        }, status=status.HTTP_200_OK)


class TicketTypePerShuttle(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        date = datetime.strptime(data["start_date"], '%Y-%m-%d')

        rows = []
        grand_am_total = 0
        grand_pm_total = 0
        grand_ten_total = 0
        grand_twelve_total = 0
        grand_fifteen_total = 0

        shuttles = Shuttle.objects.all()

        for shuttle in shuttles:
            deployments = Deployment.objects.filter(shuttle_id=shuttle.id, shift_iteration__date=date)

            # counts for the day
            am_count = 0
            pm_count = 0
            am_ten = 0
            am_twelve = 0
            am_fifteen = 0
            pm_ten = 0
            pm_twelve = 0
            pm_fifteen = 0

            for deployment in deployments:
                consumed_tickets = ConsumedTicket.objects.filter(remittance_form__deployment=deployment)

                for consumed_ticket in consumed_tickets:
                    if deployment.shift_iteration.shift.type is 'A':

                        if consumed_ticket.assigned_ticket.type is 'A':
                            print(consumed_ticket.total)
                            am_ten += consumed_ticket.total / 10
                            am_count += consumed_ticket.total / 10

                        elif consumed_ticket.assigned_ticket.type is 'B':
                            print(consumed_ticket.total)
                            am_twelve += consumed_ticket.total / 12
                            am_count += consumed_ticket.total / 12

                        else:
                            print(consumed_ticket.total)
                            am_fifteen += consumed_ticket.total / 15
                            am_count += consumed_ticket.total / 15

                    else:

                        if consumed_ticket.assigned_ticket.type is 'A':
                            print("A")
                            print(consumed_ticket.total)
                            pm_ten += consumed_ticket.total / 10
                            pm_count += consumed_ticket.total / 10

                        elif consumed_ticket.assigned_ticket.type is 'B':
                            print("B")
                            print(consumed_ticket.total)
                            pm_twelve += consumed_ticket.total / 12
                            pm_count += consumed_ticket.total / 12

                        else:
                            print("C")
                            print(consumed_ticket.total)
                            pm_count += consumed_ticket.total / 15
                            pm_fifteen += consumed_ticket.total / 15

            rows.append({
                "shuttle_id": shuttle.id,
                "shuttle_make": shuttle.make,
                "shuttle_model": shuttle.model,
                "am_total": am_count,
                "pm_total": pm_count,
                "am_ten": am_ten,
                "am_twelve": am_twelve,
                "am_fifteen": am_fifteen,
                "pm_ten": pm_ten,
                "pm_twelve": pm_twelve,
                "pm_fifteen": pm_fifteen
            })

            grand_am_total += am_count
            grand_pm_total += pm_count
            grand_ten_total += am_ten + pm_ten
            grand_twelve_total += am_twelve + pm_twelve
            grand_fifteen_total += am_fifteen + pm_fifteen

        return Response(data={
            "date": date.date(),
            "grand_total": grand_ten_total + grand_twelve_total + grand_fifteen_total,
            "grand_am_total": grand_am_total,
            "grand_pm_total": grand_pm_total,
            "grand_ten_total": grand_ten_total,
            "grand_twelve_total": grand_twelve_total,
            "grand_fifteen_total": grand_fifteen_total,
            "shuttles": rows
        }, status=status.HTTP_200_OK)


class SupervisorWeeklyReport(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        supervisor = Supervisor.objects.get(id=data["supervisor_id"])  # requests supervisor id
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        end_date = start_date + timedelta(days=6)  # for one week

        temp_start = start_date

        rows = []
        total_deployed_drivers = 0
        total_remittances = 0

        while temp_start <= end_date:
            shift_iterations = ShiftIteration.objects.filter(shift__supervisor=supervisor, date=temp_start)

            for shift_iteration in shift_iterations:
                number_of_drivers = 0
                daily_remittance = 0

                deployed_drivers = []

                for deployment in Deployment.objects.filter(shift_iteration=shift_iteration):

                    deployed_drivers.append({
                        "driver_id": deployment.driver.id,
                        "driver_name": deployment.driver.name
                    })

                    for consumed_ticket in ConsumedTicket.objects.filter(remittance_form__deployment=deployment):
                        daily_remittance += consumed_ticket.total
                    number_of_drivers += 1

                absent_drivers = []

                for drivers_assigned in DriversAssigned.objects.filter(shift=shift_iteration.shift):
                    absent = True
                    for deployed_driver in deployed_drivers:
                        if deployed_driver["driver_id"] == drivers_assigned.driver_id:
                            absent = False

                    if absent:
                        absent_drivers.append({
                            "driver_id": drivers_assigned.driver_id,
                            "driver_name": drivers_assigned.driver.name
                        })

                rows.append({
                    "day": calendar.day_name[temp_start.weekday()],
                    "date": temp_start.date(),
                    "shift": shift_iteration.shift.get_type_display(),
                    "number_of_drivers": number_of_drivers,
                    "daily_remittance": daily_remittance,
                    "deployed_drivers": deployed_drivers,
                    "absent_drivers": absent_drivers,
                    "remarks": shift_iteration.remarks
                })

                total_deployed_drivers += number_of_drivers
                total_remittances += daily_remittance

            temp_start = temp_start + timedelta(days=1)

        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "supervisor_id": supervisor.id,
            "supervisor_name": supervisor.name,
            "total_remittances": total_remittances,
            "total_deployed_drivers": total_deployed_drivers,
            "rows": rows
        }, status=status.HTTP_200_OK)


class AccumulatedSharesReport(APIView):
    @staticmethod
    def post(request):
        print(request.body)
        data = json.loads(request.body)
        members = Member.objects.all().order_by('name')
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')

        rows = []

        for member in members:
            month = 1

            temp_date = start_date

            prior_shares = ShareUtilities.get_prior_shares(member.id, temp_date)

            array = []
            accumulated_shares = 0

            while month <= 12:
                shares_bought = 0
                shares = Share.objects.filter(
                    date_of_update__gt=start_date,
                    date_of_update__year=temp_date.year,
                    date_of_update__month=month,
                    member_id=member.id
                )

                for share in shares:
                    shares_bought += share.value
                    accumulated_shares += share.value

                array.append({
                    "month": calendar.month_name[month],
                    "added_amount": shares_bought
                })
                month += 1

            rows.append({
                "name": member.name,
                "prior_shares": prior_shares,
                "accumulated_shares": accumulated_shares,
                "total_shares": prior_shares + accumulated_shares,
                "months": array
            })

        months_sum = []
        for i in range(0, 12):
            months_sum.append(sum(item['months'][i]['added_amount'] for item in rows))

        acc_total = sum(item['accumulated_shares'] for item in rows)
        prev_total = sum(item['prior_shares'] for item in rows)
        grand_total = sum(item['total_shares'] for item in rows)

        return Response(data={
            "year": start_date.year,
            "members": rows,
            "months_sum": months_sum,
            "acc_total": acc_total,
            "prev_total": prev_total,
            "grand_total": grand_total

        }, status=status.HTTP_200_OK)


class ShareUtilities(APIView):
    @staticmethod
    def get_prior_shares(member_id, date):
        shares = Share.objects.filter(date_of_update__lt=date, member_id=member_id)
        total = 0
        for share in shares:
            total += share.value
        return total


class ShuttleCostVRevenueReport(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')

        rows = []
        total_remittance = 0
        total_cost = 0
        total_fuel = 0

        for shuttle in Shuttle.objects.all():
            initialMaintenanceCost = 0

            shuttle_remittance = sum([(item.total + item.fuel_cost) for item in RemittanceForm.objects.filter(
                deployment__shuttle=shuttle.id,
                deployment__shift_iteration__date__gte=start_date
            )])

            shuttle_fuel_cost = sum([item.fuel_cost for item in RemittanceForm.objects.filter(
                deployment__shuttle=shuttle.id,
                deployment__shift_iteration__date__gte=start_date
            )])

            repairs = Repair.objects.filter(
                shuttle=shuttle,
                date_requested__gte=start_date
            )

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

            rows.append({
                "shuttle_id": shuttle.id,
                "shuttle_plate_number": shuttle.plate_number,
                "shuttle_make": shuttle.make,
                "revenue": shuttle_remittance,
                "fuel_cost": shuttle_fuel_cost,
                "cost": initialMaintenanceCost,
                "value": shuttle_remittance - shuttle_fuel_cost - initialMaintenanceCost
            })

            total_remittance += shuttle_remittance
            total_fuel += shuttle_fuel_cost
            total_cost += initialMaintenanceCost

        return Response(data={
            "start_date": start_date,
            "total_remittance": total_remittance,
            "total_costs": total_cost,
            "total_fuel": total_fuel,
            "grand_total": total_remittance - total_fuel - total_cost,
            "shuttles": rows
        }, status=status.HTTP_200_OK)


class NotificationItems(APIView):
    @staticmethod
    def get(request, user_type):
        # user type gotten from localStorage.get('user_type')
        if user_type == 'member':
            notifications = NotificationSerializer(Notification.objects.all()
                                                   .filter(type='M').order_by('-created'), many=True)
            unread = NotificationSerializer(Notification.objects.all()
                                            .filter(type='M').filter(is_read=False).order_by('-created'), many=True)
        elif user_type == 'supervisor':
            notifications = NotificationSerializer(Notification.objects
                                                   .filter(Q(type='R') | Q(type='N')).order_by('-created'), many=True)
            unread = NotificationSerializer(Notification.objects.all()
                                            .filter(type='R').filter(is_read=False).order_by('-created'), many=True)
        elif user_type == 'operations_manager':
            notifications = NotificationSerializer(Notification.objects
                                                   .filter(Q(type='I') | Q(type='R')).order_by('-created'), many=True)
            unread = NotificationSerializer(Notification.objects
                .filter(Q(type='I') | Q(type='R')).filter(is_read=False).order_by(
                '-created'), many=True)
        elif user_type == 'clerk':
            notifications = NotificationSerializer(Notification.objects
                                                   .filter(Q(type='I') | Q(type='R')).order_by('-created'), many=True)
            unread = NotificationSerializer(Notification.objects
                .filter(Q(type='I') | Q(type='R')).filter(is_read=False).order_by(
                '-created'), many=True)
        elif user_type == 'mechanic':
            notifications = NotificationSerializer(Notification.objects
                                                   .filter(Q(type='I') | Q(type='N')).order_by('-created'), many=True)
            unread = NotificationSerializer(Notification.objects
                .filter(Q(type='N') | Q(type='I')).filter(is_read=False).order_by(
                '-created'), many=True)

        return Response(data={
            'notifications': notifications.data,
            'unread': unread.data,
        }, status=status.HTTP_200_OK)


class ChangeNotificationStatus(APIView):
    @staticmethod
    def post(request, pk):
        notification = Notification.objects.get(id=pk)
        if notification.is_read == True:
            notification.is_read = False
        else:
            notification.is_read = True

        notification.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
