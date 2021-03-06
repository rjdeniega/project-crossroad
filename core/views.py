import calendar
import json
from datetime import datetime, timedelta, time

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
from members.models import Clerk, Driver, OperationsManager, Person
from members.serializers import (ClerkSerializer, DriverSerializer,
                                 MechanicSerializer, MemberSerializer,
                                 OperationsManagerSerializer, ShareSerializer,
                                 IDCardSerializer)
from remittances.models import *
from remittances.serializers import (BeepTransactionSerializer,
                                     CarwashTransactionSerializer)
from remittances.views import IterationUtilites
from datetime import datetime
from dateutil import relativedelta


class SignInView(APIView):
    @staticmethod
    def post(request):
        if "username" not in request.data or "password" not in request.data:
            return Response(data={
                "error": "Missing username or password"
            }, status=400)
        username = request.data["username"]
        password = request.data["password"]
        print(username)
        print(password)
        user = authenticate(username=username, password=password)
        # if user is None:
        #     return Response(data={
        #         "error": "Invalid credentials"
        #     }, status=401)

        users = User.objects.filter(username=username)
        if user is None:
            user = User.objects.filter(username=username).first()
        if len(users) <= 0:
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
        if user in [driver.user for driver in Driver.objects.all() if not driver.is_supervisor]:
            return "driver"
        if user in [driver.user for driver in Driver.objects.all() if driver.is_supervisor]:
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
            return DriverSerializer(Driver.objects.get(user=user)).data
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
        if "username" not in request.data or "password" not in request.data:
            return Response(data={
                "error": "Missing username,password, or user type"
            }, status=400, content_type="application/json")

        user = User()
        user.username = request.POST.get('username')
        user.set_password(request.POST.get('password'))
        user.save()

        user_type = request.POST.get('user_type')

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
            return Driver.objects.create(**data, is_supervisor=True)
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
            return DriverSerializer(user_staff)
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
    def get_userstaff_type(person):
        if person.id in [driver.id for driver in Driver.objects.all() if driver.is_supervisor]:
            return "supervisor"
        if person.id in [driver.id for driver in Driver.objects.all()]:
            return "driver"
        if person.id in [operations_manager.id for operations_manager in OperationsManager.objects.all()]:
            return "operations_manager"
        if person.id in [clerk.id for clerk in Clerk.objects.all()]:
            return "clerk"
        if person.id in [member.id for member in Member.objects.all()]:
            return "member"
        if person.id in [mechanic.id for mechanic in Mechanic.objects.all()]:
            return "mechanic"

    @staticmethod
    def get(request):
        people = PersonSerializer(Person.objects.all(), many=True).data
        for person in people:
            person["user_type"] = PersonView.get_userstaff_type(User.objects.get(pk=person['id']))

        return Response(data={
            "people": people
        }, status=status.HTTP_200_OK)

    def get_user_type(person):
        if person.id in [driver.user for driver in Driver.objects.all()]:
            return "driver"
        if person.id in [supervisor.user for supervisor in Driver.objects.filter(is_supervisor=True)]:
            return "supervisor"
        if person.id in [operations_manager.user for operations_manager in OperationsManager.objects.all()]:
            return "operations_manager"
        if person.id in [clerk.user for clerk in Clerk.objects.all()]:
            return "clerk"
        if person.id in [member.user for member in Member.objects.all()]:
            return "member"
        if person.id in [mechanic.user for mechanic in Mechanic.objects.all()]:
            return "mechanic"


class StaffView(APIView):
    @staticmethod
    def get(request):
        drivers = DriverSerializer(Driver.objects.all(), many=True)
        managers = OperationsManagerSerializer(OperationsManager.objects.all(), many=True)
        clerks = ClerkSerializer(Clerk.objects.all(), many=True)
        # supervisors = SupervisorSerializer(Supervisor.objects.all(), many=True)

        return Response(data={
            "drivers": drivers.data,
            "managers": managers.data,
            "clerks": clerks.data,
            # "supervisors": supervisors.data
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


class MemberTransactionByReport(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        if "end_date" in request.data:
            end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
        else:
            end_date = None

        report_items = []
        members = Member.objects.all()
        sorted_members = sorted([item.last_name for item in members])
        members = []
        for item in sorted_members:
            members.append(Member.objects.filter(name__contains=item)[0])
        for member in members:
            member_data = MemberSerializer(member).data
            id_cards = IDCards.objects.filter(member=Member.objects.get(pk=member.id))
            if len(id_cards) == 0:
                carwash_transactions = [item for item in
                                        CarwashTransaction.objects.filter(member=member)]
                if end_date is not None:
                    carwash_transactions = [item for item in carwash_transactions if
                                            start_date.date() <= item.date <= end_date.date()]
                else:
                    carwash_transactions = [item for item in carwash_transactions if
                                            start_date.date() == item.date]

                carwash_transactions = CarwashTransactionSerializer(carwash_transactions, many=True).data
                report_items.append({
                    "member_id": member.id,
                    "member": member_data,
                    "member_name": f'{member.last_name}, {member.first_name}',
                    "member_card": None,
                    "no_of_beep": 0,
                    "has_beep": False,
                    "no_of_carwash": len(carwash_transactions),
                    "beep_total": 0,
                    "beep_total_decimal": "{0:,.2f}".format(0),
                    "carwash_total_decimal": "{0:,.2f}".format(
                        sum([float(item['total']) for item in carwash_transactions])),
                    "carwash_total": sum([float(item['total']) for item in carwash_transactions]),
                    "beep_transactions": [],
                    "carwash_transactions": carwash_transactions,
                    "total_transactions": sum([float(item['total']) for item in carwash_transactions]),
                    "total_transactions_decimal": "{0:,.2f}".format(
                        sum([float(item['total']) for item in carwash_transactions]))
                })

            if len(id_cards) > 0:
                member_data["id_card"] = id_cards[0].can
                transactions = []
                for id_card in id_cards:
                    for item in BeepTransaction.objects.filter(card_number=id_card.can):
                        transactions.append(item)
                print(transactions)
                carwash_transactions = [item for item in
                                        CarwashTransaction.objects.filter(member=member)]
                if end_date is not None:
                    transactions = [item for item in transactions if
                                    start_date.date() <= item.shift.date <= end_date.date()]
                    carwash_transactions = [item for item in carwash_transactions if
                                            start_date.date() <= item.date <= end_date.date()]
                else:
                    transactions = [item for item in transactions if start_date.date() == item.shift.date]
                    carwash_transactions = [item for item in carwash_transactions if
                                            start_date.date() == item.date]

                serialized_transactions = BeepTransactionSerializer(transactions, many=True)
                for item in serialized_transactions.data:
                    item["shift_date"] = BeepShift.objects.get(pk=item["shift"]).date
                carwash_transactions = CarwashTransactionSerializer(carwash_transactions, many=True).data
                report_items.append({
                    "member_id": member.id,
                    "member": member_data,
                    "member_name": f'{member.last_name}, {member.first_name}',
                    "has_beep": True,
                    "member_card": IDCardSerializer(IDCards.objects.filter(member=member).last()).data,
                    "no_of_beep": len(transactions),
                    "no_of_carwash": len(carwash_transactions),
                    "beep_total": sum([item.total for item in transactions]),
                    "beep_total_decimal": "{0:,.2f}".format(
                        sum([float(item['total']) for item in serialized_transactions.data])),
                    "carwash_total_decimal": "{0:,.2f}".format(
                        sum([float(item['total']) for item in carwash_transactions])),
                    "carwash_total": sum([float(item['total']) for item in carwash_transactions]),
                    "beep_transactions": serialized_transactions.data,
                    "carwash_transactions": carwash_transactions,
                    "total_transactions": sum([float(item.total) for item in transactions]) + sum(
                        [float(item['total']) for item in carwash_transactions]),
                    "total_transactions_decimal": "{0:,.2f}".format(
                        sum([float(item.total) for item in transactions]) + sum(
                            [float(item['total']) for item in carwash_transactions]))
                })
        print(report_items)
        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "no_of_beep_total": sum(item['no_of_beep'] for item in report_items),
            "no_of_carwash_total": sum(item['no_of_carwash'] for item in report_items),
            "beep_grand_total": "{0:,.2f}".format(sum(item['beep_total'] for item in report_items)),
            "carwash_grand_total": "{0:,.2f}".format(sum(item['carwash_total'] for item in report_items)),
            "grand_total": "{0:,.2f}".format(sum(item['total_transactions'] for item in report_items)),
            "report_items": report_items
        }, status=status.HTTP_200_OK)


class PatronageRefund(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        # start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        start_date = data['start_date']
        surplus = int(data['surplus'])
        print(surplus)
        report_items = []
        if "end_date" in request.data:
            end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
        else:
            end_date = None

            # rate_of_refund = surplus / (sum([item.total for item in BeepTransaction.objects.all()]) + sum(
            #     [item.total for item in CarwashTransaction.objects.all()]))
            #
            # report_items = []
            # for member in Member.objects.all():
            #
            #     member_data = MemberSerializer(member).data
            #     try:
            #         id_cards = IDCards.objects.filter(member=Member.objects.get(pk=member.id))
            #     except ObjectDoesNotExist:
            #         report_items.append({
            #             "member": MemberSerializer(member).data,
            #             "transactions": None,
            #             "total_transactions": 0
            #         })
            #         id_card = None
            #
            #     if len(id_cards) > 0:
            #         member_data["id_card"] = id_cards.last().can
            #         transactions = []
            #         for id_card in id_cards:
            #             for item in BeepTransaction.objects.filter(card_number=id_card.can):
            #                 transactions.append(item)
            #
            #         carwash_transactions = [item for item in
            #                                 CarwashTransaction.objects.all() if item.member == member]
            #         if end_date is not None:
            #             transactions = [item for item in transactions if
            #                             start_date.date() <= item.shift.date <= end_date.date()]
            #             carwash_transactions = [CarwashTransactionSerializer(item).data for item in carwash_transactions if
            #                                     start_date.date() <= item.date <= end_date.date()]
            #         else:
            #             transactions = [item for item in transactions if start_date.date() == item.shift.date]
            #             carwash_transactions = [CarwashTransactionSerializer(item).data for item in carwash_transactions if
            #                                     start_date.date() == item.date]
            #
            #         serialized_transactions = BeepTransactionSerializer(transactions, many=True)
            #         for item in serialized_transactions.data:
            #             item["shift_date"] = BeepShift.objects.get(pk=item["shift"]).date

        # for member in Member.objects.all():
        #     member_data = MemberSerializer(member).data
        #     shares = Share.objects.filter(member=member)
        #     array = []
        #
        #     for i in range(1, 13):
        #         accumulated_month = 0
        #         for share in shares:
        #             if (share.date_of_update.month == i and share.date_of_update.year == start_date.year):
        #                 accumulated_month += share.value
        #         array.append(accumulated_month)
        #
        #     rate_of_refund = sum(array) / 12
        total_shares = sum([item.value for item in Share.objects.filter(date_of_update__year=start_date)])
        members = Member.objects.all()
        sorted_members = sorted([item.last_name for item in members])
        members = []
        for item in sorted_members:
            members.append(Member.objects.filter(name__contains=item)[0])
        for member in members:
            member_data = MemberSerializer(member).data
            shares = sum(
                [item.value for item in Share.objects.filter(member=member, date_of_update__year=start_date)])
            if total_shares == 0:
                rate_of_refund = 0
                total_shares = 0
            rate_of_refund = float(shares) / float(total_shares)

            report_items.append({
                "rate_of_refund": "{0:,.2f}".format(rate_of_refund),
                "number_of_shares": shares,
                "member": member_data,
                "member_name": f'{member.last_name}, {member.first_name}',
                "patronage_refund": "{0:,.2f}".format(float(rate_of_refund) * float(surplus)),
                "start_date": start_date
            })

            # rate_of_refund = (sum([item.total for item in transactions]) + sum(
            #     [item.total for item in carwash_transactions])) / surplus if surplus != 0 else 0

            # "no_of_beep": len(transactions),
            # "no_of_carwash": len(carwash_transactions),
            # "beep_total": sum([item.total for item in transactions]),
            # "beep_total_decimal": "{0:,.2f}".format(sum([item.total for item in transactions])),
            # "carwash_total_decimal": "{0:,.2f}".format(
            #     sum([float(item['total']) for item in serialized_transactions.data])),
            # "carwash_total": sum([float(item['total']) for item in carwash_transactions]),
            # "beep_transactions": serialized_transactions.data,
            # "carwash_transactions": carwash_transactions,
            # "total_transactions": sum([float(item.total) for item in transactions]) + sum(
            #     [float(item['total']) for item in carwash_transactions]),
            # "rate_of_refund": "{0:,.2f}".format(rate_of_refund),
            # "total_transactions_decimal": "{0:,.2f}".format(sum([item.total for item in transactions]) + sum(
            #     [float(item['total']) for item in carwash_transactions])),

            # "no_of_beep_total": sum(item['no_of_beep'] for item in report_items),
            # "no_of_carwash_total": sum(item['no_of_carwash'] for item in report_items),
            # "beep_grand_total": "{0:,.2f}".format(sum(item['beep_total'] for item in report_items)),
            # "carwash_grand_total": "{0:,.2f}".format(sum(item['carwash_total'] for item in report_items)),
            # "grand_total": "{0:,.2f}".format(sum(item['total_transactions'] for item in report_items)),

        return Response(data={
            "start_date": start_date,
            "report_items": report_items,
            "date": start_date,
            "grand_total": "{0:,.2f}".format(
                sum([float(item["patronage_refund"].replace(',', '')) for item in report_items]))
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
                    total_per_day = shifts[0]["remittance_value"] + total_remittance
                else:
                    total_per_day = total_remittance

                shifts.append({
                    "type": shift.shift.get_type_display(),
                    "remittance": "{0:,.2f}".format(total_remittance),
                    "remittance_value": total_remittance,
                    "total_per_day": "{0:,.2f}".format(total_per_day),
                    "fuel": "{0:,.2f}".format(total_fuel),
                    "remittance_minus_fuel": "{0:,.2f}".format(total_remittance - total_fuel)
                })

                total_remit_day_without_fuel += total_remittance
                total_fuel_for_day += total_fuel

            if len(shifts) == 0:
                shifts = [{
                    "type": "AM",
                    "total_per_day": "{0:,.2f}".format(0),
                    "remittance": "{0:,.2f}".format(0),
                    "fuel": "{0:,.2f}".format(0),
                    "remittance_minus_fuel": "{0:,.2f}".format(0)
                }, {
                    "type": "PM",
                    "total_per_day": "{0:,.2f}".format(0),
                    "remittance": "{0:,.2f}".format(0),
                    "fuel": "{0:,.2f}".format(0),
                    "remittance_minus_fuel": "{0:,.2f}".format(0)
                }]
            elif len(shifts) == 1 and shifts[0]['type'] == "AM":
                shifts.append({
                    "type": "PM",
                    "total_per_day": "{0:,.2f}".format(0),
                    "remittance": "{0:,.2f}".format(0),
                    "fuel": "{0:,.2f}".format(0),
                    "remittance_minus_fuel": "{0:,.2f}".format(0)
                })
            elif len(shifts) == 1 and shifts[0]['type'] == "PM":
                shifts = [{
                    "type": "AM",
                    "total_per_day": "{0:,.2f}".format(0),
                    "remittance": "{0:,.2f}".format(0),
                    "fuel": "{0:,.2f}".format(0),
                    "remittance_minus_fuel": "{0:,.2f}".format(0)
                }, shifts[0]]
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
        am_total = 0
        am_count = 0
        pm_total = 0
        pm_count = 0
        for item in rows:
            for x in item['shifts']:
                print(x['type'])
                if x['type'] == "AM":
                    string = x['remittance_minus_fuel']
                    am_total += float(string.replace(',', ''))
                    am_count += 1
                elif x['type'] == "PM":
                    string = x['remittance_minus_fuel']
                    pm_total += float(string.replace(',', ''))
                    pm_count += 1
                    # am_sum = sum([int(item) for item in rows['shifts'] if item['type'] == 'AM'])
                    # print(am_sum)
        am_average = am_total / am_count
        pm_average = pm_total / pm_count
        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "grand_remit_total": "{0:,.2f}".format(grand_total),
            "grand_am_total": "{0:,.2f}".format(am_total),
            "grand_pm_total": "{0:,.2f}".format(pm_total),
            "am_average": "{0:,.2f}".format(am_average),
            "pm_average": "{0:,.2f}".format(pm_average),
            "grand_fuel_total": "{0:,.2f}".format(grand_fuel_total),
            "grand_remit_minus_fuel": "{0:,.2f}".format(grand_total - grand_fuel_total),
            "rows": rows
        }, status=status.HTTP_200_OK)


class BeepTickets(APIView):
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
                    total_per_day = shifts[0]["remittance_value"] + total_remittance
                else:
                    total_per_day = total_remittance

                try:
                    beep_shift = BeepShift.objects.filter(date=temp_start.date(), type=shift.shift.type)[0]
                    # beep_shift = [item for item in beep_shift if item.type == shift.shift.type]
                except ObjectDoesNotExist:
                    beep_shift = []
                except IndexError:
                    beep_shift = []
                if beep_shift:
                    beep_total = sum([item.total for item in BeepTransaction.objects.filter(shift=beep_shift)])
                else:
                    beep_total = 0
                shifts.append({
                    "type": shift.shift.get_type_display(),
                    "beep_total": "{0:,.2f}".format(beep_total),
                    "beep_total_value": beep_total,
                    "beep_ticket_total_value": beep_total + total_remittance - total_fuel,
                    "remittance": "{0:,.2f}".format(total_remittance),
                    "remittance_value": total_remittance,
                    "total_per_day": "{0:,.2f}".format(total_per_day),
                    "fuel": "{0:,.2f}".format(total_fuel),
                    "remittance_minus_fuel": "{0:,.2f}".format(total_remittance - total_fuel),
                    "beep_ticket_total": "{0:,.2f}".format(beep_total + total_remittance - total_fuel)
                })

                total_remit_day_without_fuel += total_remittance
                total_fuel_for_day += total_fuel

            try:
                # am_beep = [item for item in BeepTransaction.objects.all() if
                #            item.shift.date == temp_start.date() and item.shift.type == 'A']
                am_beep = BeepTransaction.objects.filter(shift__date=temp_start.date(), shift__type='A')
                pm_beep = BeepTransaction.objects.filter(shift__date=temp_start.date(), shift__type='P')
                # pm_beep = [item for item in BeepTransaction.objects.all() if
                #            item.shift.date == temp_start.date() and item.shift.type == 'P']
                print(am_beep)
                print(pm_beep)

            except ObjectDoesNotExist:
                am_beep = []
                pm_beep = []

            am_beep_shift = sum([item.total for item in am_beep])
            pm_beep_shift = sum([item.total for item in pm_beep])

            if len(shifts) == 0:
                shifts = [{
                    "type": "AM",
                    "beep_total": "{0:,.2f}".format(am_beep_shift),
                    "beep_total_value": am_beep_shift,
                    "beep_ticket_total_value": am_beep_shift,
                    "total_per_day": "{0:,.2f}".format(0),
                    "remittance": "{0:,.2f}".format(0),
                    "fuel": "{0:,.2f}".format(0),
                    "remittance_minus_fuel": "{0:,.2f}".format(0),
                    "beep_ticket_total": "{0:,.2f}".format(am_beep_shift)
                }, {
                    "type": "PM",
                    "beep_total": "{0:,.2f}".format(pm_beep_shift),
                    "beep_total_value": pm_beep_shift,
                    "beep_ticket_total_value": pm_beep_shift,
                    "total_per_day": "{0:,.2f}".format(0),
                    "remittance": "{0:,.2f}".format(0),
                    "fuel": "{0:,.2f}".format(0),
                    "remittance_minus_fuel": "{0:,.2f}".format(0),
                    "beep_ticket_total": "{0:,.2f}".format(pm_beep_shift)
                }]
            elif len(shifts) == 1 and shifts[0]['type'] == "AM":
                shifts.append({
                    "type": "PM",
                    "beep_total": "{0:,.2f}".format(pm_beep_shift),
                    "beep_total_value": pm_beep_shift,
                    "beep_ticket_total_value": pm_beep_shift,
                    "total_per_day": "{0:,.2f}".format(0),
                    "remittance": "{0:,.2f}".format(0),
                    "fuel": "{0:,.2f}".format(0),
                    "remittance_minus_fuel": "{0:,.2f}".format(0),
                    "beep_ticket_total": "{0:,.2f}".format(pm_beep_shift)
                })
            elif len(shifts) == 1 and shifts[0]['type'] == "PM":
                shifts = [{
                    "type": "AM",
                    "beep_total": "{0:,.2f}".format(am_beep_shift),
                    "beep_total_value": am_beep_shift,
                    "beep_ticket_total_value": am_beep_shift,
                    "total_per_day": "{0:,.2f}".format(0),
                    "remittance": "{0:,.2f}".format(0),
                    "fuel": "{0:,.2f}".format(0),
                    "remittance_minus_fuel": "{0:,.2f}".format(0),
                    "beep_ticket_total_value": "{0:,.2f}".format(am_beep_shift)
                }, shifts[0]]
            rows.append({
                "date": temp_start.date(),
                "shifts": shifts,
                "total_remit_day_without_fuel": "{0:,.2f}".format(total_remit_day_without_fuel),
                "total_fuel_for_day": "{0:,.2f}".format(total_fuel_for_day),
                "total_minus_fuel": "{0:,.2f}".format(total_remit_day_without_fuel - total_fuel_for_day),
            })

            # totals
            grand_total += total_remit_day_without_fuel
            grand_fuel_total += total_fuel_for_day

            temp_start = temp_start + timedelta(days=1)
            beep_total = 0
            for item in rows:
                total = sum([x['beep_total_value'] for x in item['shifts']])
                beep_total += total

        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "beep_grand_total": "{0:,.2f}".format(beep_total),
            "grandest_total": "{0:,.2f}".format(beep_total + grand_total - grand_fuel_total),
            "grand_remit_total": "{0:,.2f}".format(grand_total),
            "grand_fuel_total": "{0:,.2f}".format(grand_fuel_total),
            "grand_remit_minus_fuel": "{0:,.2f}".format(grand_total - grand_fuel_total),
            "rows": rows
        }, status=status.HTTP_200_OK)


class BeepTicketsPerRoute(APIView):
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
        mr_grand_total = 0
        mr_grand_fuel_total = 0
        l_grand_total = 0
        l_grand_fuel_total = 0
        r_grand_total = 0
        r_grand_fuel_total = 0
        routes = []
        rows = []

        while temp_start <= end_date:
            print(temp_start)
            shift_iterations = ShiftIteration.objects.filter(date=temp_start)
            main_road = []
            kaliwa = []
            kanan = []

            mr_total_remit_day_without_fuel = 0
            mr_total_fuel_for_day = 0
            l_total_remit_day_without_fuel = 0
            l_total_fuel_for_day = 0
            r_total_remit_day_without_fuel = 0
            r_total_fuel_for_day = 0

            mr = BeepTicketsPerRoute.get_route(temp_start, shift_iterations, "M", mr_total_remit_day_without_fuel,
                                               mr_total_fuel_for_day)
            mr_route_total = sum([item["beep_ticket_total_value"] for item in mr["shifts"]])
            main_road_shifts = {
                "route": "Main Road",
                "shifts": mr["shifts"],
            }
            mr_total_remit_day_without_fuel += mr["total_remit_day_without_fuel"]
            mr_total_fuel_for_day = mr["total_fuel_for_day"]

            l = BeepTicketsPerRoute.get_route(temp_start, shift_iterations, "L", l_total_remit_day_without_fuel,
                                              l_total_fuel_for_day)
            l_route_total = sum([item["beep_ticket_total_value"] for item in l["shifts"]])

            kaliwa_shifts = {
                "route": "Kaliwa",
                "shifts": l["shifts"],
            }
            l_total_remit_day_without_fuel += l["total_remit_day_without_fuel"]
            l_total_fuel_for_day = l["total_fuel_for_day"]

            r = BeepTicketsPerRoute.get_route(temp_start, shift_iterations, "R", r_total_remit_day_without_fuel,
                                              r_total_fuel_for_day)
            r_route_total = sum([item["beep_ticket_total_value"] for item in r["shifts"]])

            kanan_shifts = {
                "route": "Kanan",
                "shifts": r['shifts'],
            }
            r_total_remit_day_without_fuel += r["total_remit_day_without_fuel"]
            r_total_fuel_for_day = r["total_fuel_for_day"]

            rows.append({
                "date": temp_start.date(),
                "routes": [main_road_shifts, kanan_shifts, kaliwa_shifts],
                "mr_route_total": "{0:,.2f}".format(mr_route_total),
                "l_route_total_value": (r_route_total),
                "r_route_total_value": (l_route_total),
                "mr_route_total_value": (mr_route_total),
                "l_route_total": "{0:,.2f}".format(r_route_total),
                "r_route_total": "{0:,.2f}".format(l_route_total),
                "grand_route_total": "{0:,.2f}".format(l_route_total + mr_route_total + r_route_total),
                "mr_total_remit_day_without_fuel": "{0:,.2f}".format(mr_total_remit_day_without_fuel),
                "mr_total_fuel_for_day": "{0:,.2f}".format(mr_total_fuel_for_day),
                "mr_total_minus_fuel": "{0:,.2f}".format(mr_total_remit_day_without_fuel - mr_total_fuel_for_day),
                "l_total_remit_day_without_fuel": "{0:,.2f}".format(l_total_remit_day_without_fuel),
                "l_total_fuel_for_day": "{0:,.2f}".format(l_total_fuel_for_day),
                "l_total_minus_fuel": "{0:,.2f}".format(l_total_remit_day_without_fuel - l_total_fuel_for_day),
                "r_total_remit_day_without_fuel": "{0:,.2f}".format(r_total_remit_day_without_fuel),
                "r_total_fuel_for_day": "{0:,.2f}".format(r_total_fuel_for_day),
                "r_total_minus_fuel": "{0:,.2f}".format(r_total_remit_day_without_fuel - r_total_fuel_for_day),
            })

            # totals
            mr_grand_total += mr_total_remit_day_without_fuel
            mr_grand_fuel_total += mr_total_fuel_for_day
            l_grand_total += l_total_remit_day_without_fuel
            l_grand_fuel_total += l_total_fuel_for_day
            r_grand_total += r_total_remit_day_without_fuel
            r_grand_fuel_total += r_total_fuel_for_day

            temp_start = temp_start + timedelta(days=1)
        mr_beep_total = 0
        l_beep_total = 0
        r_beep_total = 0
        for item in rows:
            for x in item['routes']:
                if x['route'] == "Kanan":
                    l_beep_total += (x['shifts'][0]['beep_total_value'] + x['shifts'][1]['beep_total_value'])
                elif x['route'] == "Main Road":
                    mr_beep_total += (x['shifts'][0]['beep_total_value'] + x['shifts'][1]['beep_total_value'])
                elif x['route'] == "Kaliwa":
                    l_beep_total += (x['shifts'][0]['beep_total_value'] + x['shifts'][1]['beep_total_value'])
        grandest_total = mr_beep_total + l_beep_total + r_beep_total + l_grand_total + r_grand_total + mr_grand_total - mr_grand_fuel_total - l_grand_fuel_total - r_grand_total
        mr_grand_total = sum([(item["mr_route_total_value"]) for item in rows])
        l_grand_total = sum([(item["l_route_total_value"]) for item in rows])
        r_grand_total = sum([int(item["r_route_total_value"]) for item in rows])
        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "mr_beep_grand_total": "{0:,.2f}".format(mr_beep_total),
            "l_beep_grand_total": "{0:,.2f}".format(l_beep_total),
            "r_beep_grand_total": "{0:,.2f}".format(r_beep_total),
            "grandest_total": "{0:,.2f}".format(grandest_total),
            "mr_grand_remit_total": "{0:,.2f}".format(mr_grand_total),
            "mr_grand_fuel_total": "{0:,.2f}".format(mr_grand_fuel_total),
            "mr_grand_remit_minus_fuel": "{0:,.2f}".format(mr_grand_total - mr_grand_fuel_total),
            "l_grand_remit_total": "{0:,.2f}".format(l_grand_total),
            "l_grand_fuel_total": "{0:,.2f}".format(l_grand_fuel_total),
            "l_grand_remit_minus_fuel": "{0:,.2f}".format(l_grand_total - l_grand_fuel_total),
            "r_grand_remit_total": "{0:,.2f}".format(r_grand_total),
            "r_grand_fuel_total": "{0:,.2f}".format(r_grand_fuel_total),
            "r_grand_remit_minus_fuel": "{0:,.2f}".format(r_grand_total - r_grand_fuel_total),
            "grand_route_total": "{0:,.2f}".format(mr_grand_total + r_grand_total + l_grand_total),
            "rows": rows,

        }, status=status.HTTP_200_OK)

    @staticmethod
    def get_route(temp_start, shift_iterations, route, total_remit_day_without_fuel, total_fuel_for_day):
        shifts = []
        for shift in shift_iterations:
            remittances = RemittanceForm.objects.filter(deployment__shift_iteration=shift,
                                                        deployment__shuttle__route=route)

            total_remittance = 0
            total_fuel = 0

            for remittance in remittances:
                total_remittance += (remittance.total + remittance.fuel_cost)
                total_fuel += remittance.fuel_cost

            if len(shifts) == 1:
                total_per_day = shifts[0]["remittance_value"] + total_remittance
            else:
                total_per_day = total_remittance

            try:
                print(temp_start.date())
                beep_shift = BeepShift.objects.filter(date=temp_start.date(), type=shift.shift.type)

                if len(beep_shift) > 0:
                    beep_shift = beep_shift[0]
                    beep_total = sum(
                        [item.total for item in BeepTransaction.objects.filter(shift=beep_shift, shuttle__route=route)])
                else:
                    beep_shift = None
                    beep_total = 0
            except ObjectDoesNotExist:
                beep_total = 0

            shifts.append({
                "type": shift.shift.get_type_display(),
                "beep_total": "{0:,.2f}".format(beep_total),
                "beep_total_value": beep_total,
                "beep_ticket_total_value": beep_total + total_remittance - total_fuel,
                "remittance": "{0:,.2f}".format(total_remittance),
                "remittance_value": total_remittance,
                "total_per_day": "{0:,.2f}".format(total_per_day),
                "fuel": "{0:,.2f}".format(total_fuel),
                "remittance_minus_fuel": "{0:,.2f}".format(total_remittance - total_fuel),
                "beep_ticket_total": "{0:,.2f}".format(beep_total + total_remittance - total_fuel)
            })

            total_remit_day_without_fuel += total_remittance
            total_fuel_for_day += total_fuel

        try:
            # am_beep = [item for item in BeepTransaction.objects.all() if
            #            item.shift.date == temp_start.date() and item.shift.type == 'A']
            am_beep = BeepTransaction.objects.filter(shift__date=temp_start.date(), shift__type='A',
                                                     shuttle__route=route)
            pm_beep = BeepTransaction.objects.filter(shift__date=temp_start.date(), shift__type='P',
                                                     shuttle__route=route)
            # pm_beep = [item for item in BeepTransaction.objects.all() if
            #            item.shift.date == temp_start.date() and item.shift.type == 'P']
            print(am_beep)
            print(pm_beep)

        except ObjectDoesNotExist:
            am_beep = []
            pm_beep = []

        am_beep_shift = sum([item.total for item in am_beep])
        pm_beep_shift = sum([item.total for item in pm_beep])

        if len(shifts) == 0:
            shifts = [{
                "type": "AM",
                "beep_total": "{0:,.2f}".format(am_beep_shift),
                "beep_total_value": am_beep_shift,
                "beep_ticket_total_value": am_beep_shift,
                "total_per_day": "{0:,.2f}".format(0),
                "remittance": "{0:,.2f}".format(0),
                "fuel": "{0:,.2f}".format(0),
                "remittance_minus_fuel": "{0:,.2f}".format(0),
                "beep_ticket_total": "{0:,.2f}".format(am_beep_shift)
            }, {
                "type": "PM",
                "beep_total": "{0:,.2f}".format(pm_beep_shift),
                "beep_total_value": pm_beep_shift,
                "beep_ticket_total_value": pm_beep_shift,
                "total_per_day": "{0:,.2f}".format(0),
                "remittance": "{0:,.2f}".format(0),
                "fuel": "{0:,.2f}".format(0),
                "remittance_minus_fuel": "{0:,.2f}".format(0),
                "beep_ticket_total": "{0:,.2f}".format(pm_beep_shift)
            }]
        elif len(shifts) == 1 and shifts[0]['type'] == "AM":
            shifts.append({
                "type": "PM",
                "beep_total": "{0:,.2f}".format(pm_beep_shift),
                "beep_total_value": pm_beep_shift,
                "beep_ticket_total_value": pm_beep_shift,
                "total_per_day": "{0:,.2f}".format(0),
                "remittance": "{0:,.2f}".format(0),
                "fuel": "{0:,.2f}".format(0),
                "remittance_minus_fuel": "{0:,.2f}".format(0),
                "beep_ticket_total": "{0:,.2f}".format(pm_beep_shift)
            })
        elif len(shifts) == 1 and shifts[0]['type'] == "PM":
            shifts = [{
                "type": "AM",
                "beep_total": "{0:,.2f}".format(am_beep_shift),
                "beep_total_value": am_beep_shift,
                "beep_ticket_total_value": am_beep_shift,
                "total_per_day": "{0:,.2f}".format(0),
                "remittance": "{0:,.2f}".format(0),
                "fuel": "{0:,.2f}".format(0),
                "remittance_minus_fuel": "{0:,.2f}".format(0),
                "beep_ticket_total_value": "{0:,.2f}".format(am_beep_shift)
            }, shifts[0]]

        return {
            "shifts": shifts,
            "total_remit_day_without_fuel": total_remit_day_without_fuel,
            "total_fuel_for_day": total_fuel_for_day,
        }


class RemittancePerRouteReport(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        end_date = start_date + timedelta(days=6)  # for one week

        temp_start = start_date

        rows = []
        kaliwa_total = 0
        kanan_total = 0
        main_road_total = 0

        while temp_start <= end_date:
            remittances = RemittanceForm.objects.filter(deployment__shift_iteration__date=temp_start)

            kaliwa_count = 0
            kanan_count = 0
            main_road_count = 0

            for remittance in remittances:
                if remittance.deployment.route is 'L':
                    kaliwa_count += remittance.total + remittance.fuel_cost + remittance.other_cost
                elif remittance.deployment.route is 'R':
                    kanan_count += remittance.total + remittance.fuel_cost + remittance.other_cost
                else:
                    main_road_count += remittance.total + remittance.fuel_cost + remittance.other_cost

            rows.append({
                "date": temp_start,
                "day": calendar.day_name[temp_start.weekday()],
                "kaliwa": "{0:,.2f}".format(kaliwa_count),
                "kanan": "{0:,.2f}".format(kanan_count),
                "main_road": "{0:,.2f}".format(main_road_count),
            })

            kaliwa_total += kaliwa_count
            kanan_total += kanan_count
            main_road_total += main_road_count

            temp_start = temp_start + timedelta(days=1)

        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "kaliwa_total": "{0:,.2f}".format(kaliwa_total),
            "kanan_total": "{0:,.2f}".format(kanan_total),
            "main_road_total": "{0:,.2f}".format(main_road_total),
            "days": rows
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
                    "date": temp_start.date(),
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
            "start_date": start_date.date(),
            "end_date": end_date.date(),
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

        if "end_date" not in request.data:
            end_date = start_date + timedelta(days=6)  # for one week
        else:
            end_date = datetime.strptime(data["end_date"], '%Y-%m-%d')
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

            shuttles = []

            for shuttle in Shuttle.objects.all():

                am_count = 0
                pm_count = 0
                am_ten = 0
                am_twelve = 0
                am_fifteen = 0
                pm_ten = 0
                pm_twelve = 0
                pm_fifteen = 0

                for deployment in deployments:
                    consumed_tickets = ConsumedTicket.objects.filter(remittance_form__deployment=deployment,
                                                                     remittance_form__deployment__shuttle_id=shuttle.id)

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
                shuttle_route = None
                if shuttle.route == "M":
                    shuttle_route = "Main Road"
                elif shuttle.route == "R":
                    shuttle_route = "Kanan"
                elif shuttle.route == "L":
                    shuttle_route = "Kaliwa"
                shuttles.append({
                    "shuttle_id": shuttle.id,
                    "shuttle_number": shuttle.shuttle_number,
                    "shuttle_plate": shuttle.plate_number,
                    "shuttle_make": shuttle.make,
                    "shuttle_model": shuttle.model,
                    "shuttle_route": shuttle_route,
                    "am_total": am_count,
                    "pm_total": pm_count,
                    "am_ten": am_ten,
                    "am_twelve": am_twelve,
                    "am_fifteen": am_fifteen,
                    "pm_ten": pm_ten,
                    "pm_twelve": pm_twelve,
                    "pm_fifteen": pm_fifteen,
                    "day_total": am_ten + pm_ten + am_twelve + pm_twelve + am_fifteen + pm_fifteen,
                })
            ten_total = sum([item['am_ten'] for item in shuttles]) + sum([item['pm_ten'] for item in shuttles])
            twelve_total = sum([item['am_twelve'] for item in shuttles]) + sum([item['pm_twelve'] for item in shuttles])
            fifteen_total = sum([item['am_fifteen'] for item in shuttles]) + sum(
                [item['pm_fifteen'] for item in shuttles])
            mr_total = sum([item['am_twelve'] for item in shuttles if item['shuttle_route'] == "Main Road"]) + sum(
                [item['pm_twelve'] for item in shuttles if item['shuttle_route'] == "Main Road"]) + sum(
                [item['am_fifteen'] for item in shuttles if item['shuttle_route'] == "Main Road"]) + sum(
                [item['pm_fifteen'] for item in shuttles if item['shuttle_route'] == "Main Road"]) + sum(
                [item['am_ten'] for item in shuttles if item['shuttle_route'] == "Main Road"]) + sum(
                [item['pm_ten'] for item in shuttles if item['shuttle_route'] == "Main Road"])
            kaliwa_total = sum([item['am_twelve'] for item in shuttles if item['shuttle_route'] == "Kaliwa"]) + sum(
                [item['pm_twelve'] for item in shuttles if item['shuttle_route'] == "Kaliwa"]) + sum(
                [item['am_fifteen'] for item in shuttles if item['shuttle_route'] == "Kaliwa"]) + sum(
                [item['pm_fifteen'] for item in shuttles if item['shuttle_route'] == "Kaliwa"]) + sum(
                [item['am_ten'] for item in shuttles if item['shuttle_route'] == "Kaliwa"]) + sum(
                [item['pm_ten'] for item in shuttles if item['shuttle_route'] == "Kaliwa"])
            kanan_total = sum([item['am_twelve'] for item in shuttles if item['shuttle_route'] == "Kanan"]) + sum(
                [item['pm_twelve'] for item in shuttles if item['shuttle_route'] == "Kanan"]) + sum(
                [item['am_fifteen'] for item in shuttles if item['shuttle_route'] == "Kanan"]) + sum(
                [item['pm_fifteen'] for item in shuttles if item['shuttle_route'] == "Kanan"]) + sum(
                [item['am_ten'] for item in shuttles if item['shuttle_route'] == "Kanan"]) + sum(
                [item['pm_ten'] for item in shuttles if item['shuttle_route'] == "Kanan"])

            days.append({
                "date": temp_start.date(),
                "shuttles": shuttles,
                "ten_total": ten_total,
                "twelve_total": twelve_total,
                "fifteen_total": fifteen_total,
                "day_total": ten_total + twelve_total + fifteen_total,
                "mr_total": mr_total,
                "kanan_total": kanan_total,
                "kaliwa_total": kaliwa_total,
            })

            # grand_am_total += am_count
            # grand_pm_total += pm_count
            # grand_ten_total += am_ten + pm_ten
            # grand_twelve_total += am_twelve + pm_twelve
            # grand_fifteen_total += am_fifteen + pm_fifteen
            # "grand_total": grand_ten_total + grand_twelve_total + grand_fifteen_total,
            # "grand_am_total": grand_am_total,
            # "grand_pm_total": grand_pm_total,
            # "grand_ten_total": grand_ten_total,
            # "grand_twelve_total": grand_twelve_total,
            # "grand_fifteen_total": grand_fifteen_total,

            temp_start = temp_start + timedelta(days=1)
            grand_am_total = 0
            grand_pm_total = 0
            grand_ten_total = 0
            grand_twelve_total = 0
            grand_fifteen_total = 0
            grand_total = 0
            for item in days:
                grand_am_total += sum([shuttle['am_total'] for shuttle in item['shuttles']])
                grand_pm_total += sum([shuttle['pm_total'] for shuttle in item['shuttles']])
                grand_ten_total += item['ten_total']
                grand_twelve_total += item['twelve_total']
                grand_fifteen_total += item['fifteen_total']

        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "days": days,
            "grand_am_total": grand_am_total,
            "grand_pm_total": grand_pm_total,
            "grand_ten_total": grand_ten_total,
            "grand_twelve_total": grand_twelve_total,
            "grand_fifteen_total": grand_fifteen_total,
            "grand_total": grand_am_total + grand_pm_total,
        }, status=status.HTTP_200_OK)


class TicketTypeWithRange(APIView):
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
        am_stack = []
        pm_stack = []
        for item in days:
            am_stack.append([item['am_ten'], item['am_twelve'], item['am_fifteen']])
            pm_stack.append([item['pm_ten'], item['pm_twelve'], item['pm_fifteen']])
        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "dates": [item['date'] for item in days],
            "am_stack": am_stack,
            "pm_stack": pm_stack,
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
                "shuttle_number": shuttle.shuttle_number,
                "shuttle_make": shuttle.make,
                "shuttle_model": shuttle.model,
                "shuttle_route": shuttle.route,
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
        supervisor = Driver.objects.get(id=data["supervisor_id"])  # requests supervisor id
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        end_date = start_date + timedelta(days=6)  # for one week

        temp_start = start_date

        rows = []
        total_deployed_drivers = 0
        total_remittances = 0
        total_costs = 0
        total_income = 0

        while temp_start <= end_date:
            shift_iterations = ShiftIteration.objects.filter(shift__supervisor=supervisor, date=temp_start)

            for shift_iteration in shift_iterations:
                number_of_drivers = 0
                daily_remittance = 0
                daily_cost = 0
                daily_income = 0

                deployed_drivers = []
                absent_drivers = []
                temp_deployed_drivers = [item.driver for item in
                                         Deployment.objects.filter(shift_iteration=shift_iteration)]
                print(temp_deployed_drivers)
                present_drivers = PresentDrivers.objects.filter(datetime__date=temp_start)
                print(present_drivers)
                for drivers_assigned in DriversAssigned.objects.filter(shift=shift_iteration.shift):
                    absent = True
                    for deployed_driver in temp_deployed_drivers:
                        if deployed_driver.id == drivers_assigned.driver_id:
                            absent = False
                            driver_name = ""
                        if absent:
                            sub_driver = SubbedDeployments.objects.filter(absent_driver=drivers_assigned,
                                                                          deployment__shift_iteration__shift=shift_iteration.shift,
                                                                          deployment__shift_iteration__date=temp_start)
                            if len(sub_driver) > 0:
                                if sub_driver[0].deployment.driver.id not in [item['sub_driver_id'] for item in
                                                                              absent_drivers]:
                                    sub_driver = sub_driver[0]
                                    driver = sub_driver.deployment.driver
                                    absent_drivers.append({
                                        "driver_id": drivers_assigned.driver_id,
                                        "driver_name": drivers_assigned.driver.name,
                                        "sub_driver": driver.name,
                                        "sub_driver_id": driver.id,
                                    })
                            else:
                                if drivers_assigned.driver_id not in [item['driver_id'] for item in
                                                                      absent_drivers] and drivers_assigned.driver_id not in [
                                    item.assignedDriver.driver.id for item in present_drivers]:
                                    absent_drivers.append({
                                        "driver_id": drivers_assigned.driver_id,
                                        "driver_name": drivers_assigned.driver.name,
                                        "sub_driver": "",
                                        "sub_driver_id": "",
                                    })

                number_of_drivers += 1
                deployments = Deployment.objects.filter(shift_iteration=shift_iteration)

                for deployment in deployments:
                    driver_remit = 0
                    driver_fuel = 0
                    driver_cost = 0
                    for consumed_ticket in ConsumedTicket.objects.filter(remittance_form__deployment=deployment):
                        daily_remittance += consumed_ticket.total
                        driver_remit += consumed_ticket.total
                    for remittance in RemittanceForm.objects.filter(deployment=deployment):
                        daily_cost += remittance.fuel_cost + remittance.other_cost
                        daily_income += remittance.total
                        driver_cost += remittance.fuel_cost + remittance.other_cost

                    temp_absent_drivers = [item['sub_driver'] for item in absent_drivers]
                    type = "Normal"
                    if deployment.driver.name in temp_absent_drivers:
                        type = "Sub-in"

                    redeployments = Redeployments.objects.filter(deployment=deployment)

                    if deployment.driver in [item.deployment.driver for item in redeployments]:
                        type = "Redeployed"

                    rem = RemittanceForm.objects.get(deployment=deployment)
                    driver_assigned = DriversAssigned.objects.filter(driver=deployment.driver,
                                                                     shift=deployment.shift_iteration.shift).first()
                    shift_type = rem.deployment.shift_iteration.shift.type
                    deployment_type = 'R'

                    if driver_assigned is not None:
                        shift_type = driver_assigned.shift.type
                        deployment_type = driver_assigned.deployment_type

                    expected_arrival = None
                    if shift_type == "A" and (deployment_type == "Regular" or deployment_type == "R"):
                        expected_arrival = rem.deployment.start_time.replace(hour=5, minute=0, second=0, microsecond=0)
                    if shift_type == "A" and (deployment_type == "Early" or deployment_type == "E"):
                        expected_arrival = rem.deployment.start_time.replace(hour=4, minute=30, second=0,
                                                                             microsecond=0)
                    if shift_type == "P" and (deployment_type == "Regular" or deployment_type == "R"):
                        expected_arrival = rem.deployment.start_time.replace(hour=14, minute=0, second=0,
                                                                             microsecond=0)
                    if shift_type == "P" and (deployment_type == "Late" or deployment_type == "L"):
                        expected_arrival = rem.deployment.start_time.replace(hour=16, minute=0, second=0,
                                                                             microsecond=0)

                    r_status = "Late" if rem.deployment.start_time > expected_arrival else "On Time"

                    # if deployment.driver.id not in [item['driver_id'] for item in
                    #                                 deployed_drivers] and not driver_remit == 0:
                    if type == "Sub-in":
                        r_status = "On Time"
                    deployed_drivers.append({
                        "type": type,
                        "status": r_status,
                        "driver_id": deployment.driver.id,
                        "driver_name": deployment.driver.name,
                        "shuttle": f'{deployment.shuttle.shuttle_number} - {deployment.shuttle.plate_number}',
                        "remittance": "{0:,.2f}".format(driver_remit),
                        "cost": "{0:,.2f}".format(driver_cost),
                        "total": "{0:,.2f}".format(driver_remit - driver_cost),
                    })

                for item in present_drivers:
                    if item.is_dayoff:
                        deployed_drivers.append({
                            "type": "Day Off",
                            "status": "On Time",
                            "driver_id": item.assignedDriver.driver.id,
                            "driver_name": item.assignedDriver.driver.name,
                            "shuttle": "N/A",
                            "remittance": "{0:,.2f}".format(0),
                            "cost": "{0:,.2f}".format(0),
                            "total": "{0:,.2f}".format(0),
                        })

                rows.append({
                    "day": calendar.day_name[temp_start.weekday()],
                    "date": temp_start.date(),
                    "shift": shift_iteration.shift.get_type_display(),
                    "number_of_drivers": number_of_drivers,
                    "daily_remittance": "{0:,.2f}".format(daily_remittance),
                    "daily_cost": "{0:,.2f}".format(daily_cost),
                    "daily_income": "{0:,.2f}".format(daily_income),
                    "deployed_drivers": deployed_drivers,
                    "absent_drivers": absent_drivers,
                    "remarks": shift_iteration.remarks
                })

                total_deployed_drivers += number_of_drivers
                total_remittances += daily_remittance
                total_costs += daily_cost
                total_income += daily_income

            temp_start = temp_start + timedelta(days=1)

        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "supervisor_id": supervisor.id,
            "supervisor_name": supervisor.name,
            "total_remittances": "{0:,.2f}".format(total_remittances),
            "total_costs": "{0:,.2f}".format(total_costs),
            "total_income": "{0:,.2f}".format(total_income),
            "total_deployed_drivers": total_deployed_drivers,
            "rows": rows
        }, status=status.HTTP_200_OK)


class AccumulatedSharesReport(APIView):
    @staticmethod
    def post(request):
        print(request.body)
        data = json.loads(request.body)
        members = Member.objects.all().order_by('name')
        if data['filter'] == "name":
            sorted_members = sorted([item.last_name for item in members])
            members = []
            for item in sorted_members:
                members.append(Member.objects.filter(name__contains=item)[0])
        elif data['filter'] == "date":
            members = Member.objects.all().order_by('-accepted_date')

            # start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        start_date = datetime(data['start_date'], 1, 1, 0, 0, 0)

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
                    # date_of_update__gt=start_date,
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
                "is_new": member.accepted_date > (datetime.now() - timedelta(days=366)).date(),
                "name": f'{member.last_name}, {member.first_name}',
                "accepted_date": member.accepted_date,
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
        date = date - timedelta(days=365)
        shares = Share.objects.filter(date_of_update__year=date.year, member_id=member_id)
        total = 0
        for share in shares:
            total += share.value
        return total


class ShuttleCostVRevenueReport(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        if "end_date" in request.data:
            end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
        else:
            end_date = start_date

        rows = []
        total_remittance = 0
        total_cost = 0
        total_fuel = 0
        grand_depreciation = 0
        total_purchase_cost = 0
        grand_net = 0
        grand_total_major = 0
        grand_cost_depreciation = 0

        for shuttle in Shuttle.objects.all():
            initialMaintenanceCost = 0
            major_repairs_cost = 0
            cost_depreciation = 0

            shuttle_remittance = sum([(item.total + item.fuel_cost) for item in RemittanceForm.objects.filter(
                deployment__shuttle=shuttle.id,
                deployment__shift_iteration__date__gte=start_date,
                deployment__shift_iteration__date__lte=end_date,
            )])

            shuttle_fuel_cost = sum([item.fuel_cost for item in RemittanceForm.objects.filter(
                deployment__shuttle=shuttle.id,
                deployment__shift_iteration__date__gte=start_date,
                deployment__shift_iteration__date__lte=end_date,
            )])

            repairs = Repair.objects.filter(
                shuttle=shuttle,
                date_requested__gte=start_date,
                date_requested__lte=end_date,
                degree="Major"
            )

            for repair in repairs:
                if repair.degree == "Major":
                    for modification in repair.modifications.all():
                        item = Item.objects.get(id=modification.item_used.id)
                        if item.item_type == "Physical Measurement":
                            major_repairs_cost = float(major_repairs_cost) + (
                                float(item.unit_price) / (float(item.measurement) / float(modification.quantity)))
                        elif item.item_type == "Liquid Measurement":
                            major_repairs_cost = float(major_repairs_cost) + (
                                float(item.unit_price) / (float(item.measurement) / float(modification.quantity)))
                        else:
                            major_repairs_cost = major_repairs_cost + (
                                float(modification.quantity) * float(item.unit_price))

                    for outsourced in repair.outsourced_items.all():
                        amount = float(outsourced.quantity * outsourced.unit_price)
                        major_repairs_cost += float(amount)

                if repair.labor_fee:
                    initialMaintenanceCost = float(initialMaintenanceCost) + float(repair.labor_fee)

                for modification in repair.modifications.all():
                    item = Item.objects.get(id=modification.item_used.id)
                    if item.item_type == "Physical Measurement":
                        initialMaintenanceCost = float(initialMaintenanceCost) + (
                            float(item.unit_price) / (float(item.measurement) / float(modification.quantity)))
                    elif item.item_type == "Liquid Measurement":
                        initialMaintenanceCost = float(initialMaintenanceCost) + (
                            float(item.unit_price) / (float(item.measurement) / float(modification.quantity)))
                    else:
                        initialMaintenanceCost = float(initialMaintenanceCost) + (
                            float(modification.quantity) * float(item.unit_price))

                for outsourced in repair.outsourced_items.all():
                    amount = outsourced.quantity * outsourced.unit_price
                    initialMaintenanceCost = initialMaintenanceCost + float(amount)

            value = (shuttle.purchase_price - shuttle.salvage_value)
            depreciation_rate = float((shuttle.purchase_price - shuttle.salvage_value)) * float(1 / shuttle.lifespan)

            temp_start_date = shuttle.date_acquired
            total_depreciation = 0

            months = ShuttleCostVRevenueReport.diff_month(end_date, shuttle.date_acquired)
            total_depreciation = depreciation_rate * months
            print(months)

            net_value = float(value) + float(shuttle_remittance) - float(
                shuttle_fuel_cost) - initialMaintenanceCost - total_depreciation
            print("{0:,.2f}".format(shuttle_remittance))
            print(str(major_repairs_cost) + " major repair")
            rows.append({
                "purchase_date": shuttle.date_acquired,
                "purchase_cost": "{0:,.2f}".format(float(value)),
                "shuttle_id": f'{shuttle.id}- {shuttle.model} - {shuttle.make}',
                "shuttle_plate_number": shuttle.plate_number,
                "shuttle_make": shuttle.make,
                "revenue_value": shuttle_remittance,
                "fuel_value": shuttle_fuel_cost,
                "revenue": "{0:,.2f}".format(shuttle_remittance),
                "fuel_cost": "{0:,.2f}".format(float(shuttle_fuel_cost)),
                "major_total": "{0:,.2f}".format(float(initialMaintenanceCost)),
                "depreciation": "{0:,.2f}".format(float(total_depreciation)),
                "cost": "{0:,.2f}".format(float(initialMaintenanceCost)),
                "cost_depreciation": "{0:,.2f}".format(float(initialMaintenanceCost + total_depreciation)),
                "value": "{0:,.2f}".format(
                    float(shuttle_remittance) - float(shuttle_fuel_cost) - initialMaintenanceCost),
                "net_value": "{0:,.2f}".format(float(net_value)),
            })
            grand_depreciation += total_depreciation
            total_remittance += shuttle_remittance
            total_fuel += shuttle_fuel_cost
            total_cost += initialMaintenanceCost
            total_purchase_cost += value
            grand_net += net_value
            grand_total_major += major_repairs_cost
            grand_cost_depreciation += (initialMaintenanceCost + total_depreciation)

        return Response(data={
            "grand_net": "{0:,.2f}".format(grand_net),
            "total_purchase_cost": "{0:,.2f}".format(total_purchase_cost),
            "total_depreciation": "{0:,.2f}".format(grand_depreciation),
            "shuttle_maintenance_costs": [
                (float(item['cost'].replace(',', '')) + float(item['fuel_cost'].replace(',', ''))) for item in
                rows],
            "shuttle_revenues": [float(item['revenue'].replace(',', '')) for item in rows],
            "shuttle_fuel_costs": [float(item['fuel_cost'].replace(',', '')) for item in rows],
            "shuttle_depreciations": [float(item['depreciation'].replace(',', '')) for item in rows],
            "shuttle_major_repairs": [float(item['major_total'].replace(',', '')) for item in rows],
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "total_remittance": "{0:,.2f}".format(total_remittance),
            "total_costs": "{0:,.2f}".format(total_cost),
            "total_fuel": "{0:,.2f}".format(total_fuel),
            "grand_total": "{0:,.2f}".format(float(total_remittance) - float(total_fuel) - total_cost),
            "grand_cost_depreciation": "{0:,.2f}".format(grand_cost_depreciation),
            "shuttles": rows,
            "grand_total_major": "{0:,.2f}".format(grand_total_major),
        }, status=status.HTTP_200_OK)

    @staticmethod
    def diff_month(d1, d2):
        value = (d1.year - d2.year) * 12 + d1.month - d2.month
        return value if value != 0 else 1


class RemittanceForTheMonth(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)

        main_road_values = []
        kaliwa_values = []
        kanan_values = []
        new_days = []
        rem = RemittanceForTheMonth()

        print(data['interval'])

        if data["interval"] == "day":
            date = datetime.strptime(data["start_date"], '%Y-%m-%d')
            if "end_date" in request.data:
                end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
            else:
                end_date = date + timedelta(days=6)
            year = date.year
            month = date.month
            num_days = calendar.monthrange(year, month)[1]
            temp_date = date

            days = [datetime(year, month, day) for day in range(1, num_days + 1)]

            while temp_date < end_date:
                main_road_value = rem.get_remittance_total("M", temp_date) + rem.get_beep_total("M", temp_date)
                kaliwa_value = rem.get_remittance_total("L", temp_date) + rem.get_beep_total("L", temp_date)
                kanan_value = rem.get_remittance_total("R", temp_date) + rem.get_beep_total("R", temp_date)

                main_road_values.append(main_road_value)
                kaliwa_values.append(kaliwa_value)
                kanan_values.append(kanan_value)
                new_days.append(temp_date.date())

                temp_date += timedelta(days=1)

            return Response(data={
                "days": new_days,
                "type": "day",
                "start_date": date.date(),
                "end_date": end_date.date(),
                "main_road_values": main_road_values,
                "kaliwa_values": kaliwa_values,
                "kanan_values": kanan_values,
            }, status=status.HTTP_200_OK)

        elif data["interval"] == "month":
            days = []
            date = datetime(data['start_date'], 1, 1)
            temp_date = datetime(data['start_date'], 1, 1)
            print(temp_date)

            for i in range(0, 12):
                value = calendar.monthrange(temp_date.year, temp_date.month)[1]
                day = value
                days.append(calendar.month_name[temp_date.month])

                main_road_value = rem.get_remittance_total_monthly("M", temp_date) + rem.get_beep_total_monthly("M",
                                                                                                                temp_date)
                print(main_road_value)
                kaliwa_value = rem.get_remittance_total_monthly("L", temp_date) + rem.get_beep_total_monthly("L",
                                                                                                             temp_date)
                kanan_value = rem.get_remittance_total_monthly("R", temp_date) + rem.get_beep_total_monthly("R",
                                                                                                            temp_date)

                main_road_values.append(main_road_value)
                kaliwa_values.append(kaliwa_value)
                kanan_values.append(kanan_value)

                temp_date += timedelta(days=day)

                if i == 10:
                    end_date = temp_date
            return Response(data={
                "days": days,
                "start_date": f'{date.date().year}',
                "end_date": f'{end_date.date().month} {end_date.date().year}',
                "main_road_values": main_road_values,
                "kaliwa_values": kaliwa_values,
                "type": "month",
                "kanan_values": kanan_values,
            }, status=status.HTTP_200_OK)

        elif data["interval"] == "year":
            date = datetime(data['start_date'], 1, 1)
            days = []
            temp_date = datetime(data['start_date'], 1, 1)
            print(temp_date)

            for i in range(0, 5):
                days.append(temp_date.year)

                main_road_value = rem.get_remittance_total_yearly("M", temp_date) + rem.get_beep_total_yearly("M",
                                                                                                              temp_date)
                kaliwa_value = rem.get_remittance_total_yearly("L", temp_date) + rem.get_beep_total_yearly("L",
                                                                                                           temp_date)
                kanan_value = rem.get_remittance_total_yearly("R", temp_date) + rem.get_beep_total_yearly("R",
                                                                                                          temp_date)

                main_road_values.append(main_road_value)
                kaliwa_values.append(kaliwa_value)
                kanan_values.append(kanan_value)

                temp_date -= timedelta(days=366)

                if i == 3:
                    end_date = temp_date

            return Response(data={
                "days": reversed(days),
                "start_date": f'{end_date.year}',
                "end_date": f'{date.year}',
                "main_road_values": reversed(main_road_values),
                "kaliwa_values": reversed(kaliwa_values),
                "kanan_values": reversed(kanan_values),
                "type": "year",
            }, status=status.HTTP_200_OK)

        elif data['interval'] == "quarter":
            days = []
            date = datetime(data['start_date'], 1, 1)
            temp_date = datetime(data['start_date'], 1, 1)
            print(temp_date)

            for i in range(1, 13, 3):
                days = ['Q1', 'Q2', 'Q3', 'Q4']
                days_total = 0

                main_road_value = rem.get_remittance_total_quarterly("M", temp_date, i,
                                                                     i + 2) + rem.get_beep_total_quarterly("M",
                                                                                                           temp_date, i,
                                                                                                           i + 2)
                print(main_road_value)
                kaliwa_value = rem.get_remittance_total_quarterly("L", temp_date, i,
                                                                  i + 2) + rem.get_beep_total_quarterly("L",
                                                                                                        temp_date, i,
                                                                                                        i + 2)
                kanan_value = rem.get_remittance_total_quarterly("R", temp_date, i,
                                                                 i + 2) + rem.get_beep_total_quarterly("R",
                                                                                                       temp_date, i,
                                                                                                       i + 2)

                main_road_values.append(main_road_value)
                kaliwa_values.append(kaliwa_value)
                kanan_values.append(kanan_value)

                if i == 11:
                    end_date = temp_date
            return Response(data={
                "days": days,
                "start_date": date.date().year,
                "end_date": date.date().year,
                "main_road_values": main_road_values,
                "kaliwa_values": kaliwa_values,
                "kanan_values": kanan_values,
                "type": "quarter",
            }, status=status.HTTP_200_OK)

        elif data['interval'] == "week":
            date = datetime.strptime(data["start_date"], '%Y-%m-%d')
            if "end_date" in request.data:
                end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
            else:
                end_date = date + timedelta(days=6)
            days = []
            temp_date = date
            print(temp_date)

            for i in range(1, 28, 7):
                days = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
                days_total = 0

                main_road_value = rem.get_remittance_total_weekly("M", temp_date, i, i + 6) + rem.get_beep_total_weekly(
                    "M",
                    temp_date, i,
                    i + 6)
                print(main_road_value)
                kaliwa_value = rem.get_remittance_total_weekly("L", temp_date, i,
                                                               i + 6) + rem.get_beep_total_weekly("L",
                                                                                                  temp_date, i,
                                                                                                  i + 6)
                kanan_value = rem.get_remittance_total_weekly("R", temp_date, i,
                                                              i + 6) + rem.get_beep_total_weekly("R",
                                                                                                 temp_date, i,
                                                                                                 i + 6)

                main_road_values.append(main_road_value)
                kaliwa_values.append(kaliwa_value)
                kanan_values.append(kanan_value)

                if i == 11:
                    end_date = temp_date
            return Response(data={
                "days": days,
                "start_date": f'{calendar.month_name[date.date().month]} {date.date().year}',
                "end_date": f'{calendar.month_name[date.date().month]} {date.date().year}',
                "main_road_values": main_road_values,
                "kaliwa_values": kaliwa_values,
                "kanan_values": kanan_values,
                "type": "week",
            }, status=status.HTTP_200_OK)

        return Response(data={
            "data": "it worked"
        }, status=status.HTTP_200_OK)

    @staticmethod
    def get_remittance_total(route, date):
        remittances = RemittanceForm.objects.filter(deployment__shift_iteration__date=date,
                                                    deployment__shuttle__route=route)
        total = 0
        for remittance in remittances:
            total += remittance.get_remittances_only()
        return total

    @staticmethod
    def get_remittance_total_monthly(route, date):
        remittances = RemittanceForm.objects.filter(deployment__shift_iteration__date__year=date.year,
                                                    deployment__shift_iteration__date__month=date.month,
                                                    deployment__shuttle__route=route)
        total = 0
        for remittance in remittances:
            total += remittance.get_remittances_only()
        return total

    @staticmethod
    def get_remittance_total_yearly(route, date):
        remittances = RemittanceForm.objects.filter(deployment__shift_iteration__date__year=date.year,
                                                    deployment__shuttle__route=route)
        total = 0
        for remittance in remittances:
            total += remittance.get_remittances_only()
        return total

    @staticmethod
    def get_beep_total(route, date):
        beeps = BeepTransaction.objects.filter(shift__date=date, shuttle__route=route)
        total = 0
        for beep in beeps:
            total += beep.total
        return total

    @staticmethod
    def get_beep_total_monthly(route, date):
        beeps = BeepTransaction.objects.filter(shift__date__year=date.year, shift__date__month=date.month,
                                               shuttle__route=route)
        total = 0
        for beep in beeps:
            total += beep.total
        return total

    @staticmethod
    def get_beep_total_yearly(route, date):
        beeps = BeepTransaction.objects.filter(shift__date__year=date.year,
                                               shuttle__route=route)
        total = 0
        for beep in beeps:
            total += beep.total
        return total

    @staticmethod
    def get_remittance_total_quarterly(route, date, start_month, end_month):
        print(date.year)
        remittances = RemittanceForm.objects.filter(deployment__shift_iteration__date__year=date.year,
                                                    deployment__shift_iteration__date__month__gte=start_month,
                                                    deployment__shift_iteration__date__month__lte=end_month,
                                                    deployment__shuttle__route=route)
        total = 0
        for remittance in remittances:
            total += remittance.get_remittances_only()
        return total

    @staticmethod
    def get_beep_total_quarterly(route, date, start_month, end_month):
        beeps = BeepTransaction.objects.filter(shift__date__year=date.year,
                                               shift__date__month__gte=start_month,
                                               shift__date__month__lte=end_month,
                                               shuttle__route=route)
        total = 0
        for beep in beeps:
            total += beep.total
        return total

    @staticmethod
    def get_remittance_total_weekly(route, date, start_date, end_date):
        print(date.year)
        remittances = RemittanceForm.objects.filter(deployment__shift_iteration__date__year=date.year,
                                                    deployment__shift_iteration__date__month=date.month,
                                                    deployment__shift_iteration__date__day__gte=start_date,
                                                    deployment__shift_iteration__date__day__lte=end_date,
                                                    deployment__shuttle__route=route)
        total = 0
        for remittance in remittances:
            total += remittance.get_remittances_only()
        return total

    @staticmethod
    def get_beep_total_weekly(route, date, start_day, end_day):
        beeps = BeepTransaction.objects.filter(shift__date__year=date.year,
                                               shift__date__month=date.month,
                                               shift__date__day__gte=start_day,
                                               shift__date__day__lte=end_day,
                                               shuttle__route=route)
        total = 0
        for beep in beeps:
            total += beep.total
        return total


class NotificationItems(APIView):
    @staticmethod
    def get(request, user_type, user_id):
        # user type gotten from localStorage.get('user_type')
        user = SignInView.get_user_staff(user_type, User.objects.get(pk=user_id))
        notifications = NotificationSerializer(Notification.objects.all(), many=True)
        unread = NotificationSerializer(Notification.objects.all(), many=True)
        Notification.objects.filter(is_read=True).hard_delete()
        print(user_type)
        print(user_id)
        print(user)
        if user_type == 'member':
            NotificationItems.get_member_notifs(user)
            notifications = NotificationSerializer(Notification.objects.all()
                                                   .filter(type='M').order_by('-created'), many=True)

            unread = NotificationSerializer(Notification.objects.all()
                                            .filter(type='M').filter(is_read=False).order_by('-created'), many=True)
        elif user_type == 'supervisor':
            notifications = None
            unread = None
            # notifications = NotificationSerializer(Notification.objects
            #                                        .filter(Q(type='R') | Q(type='N')).order_by('-created'), many=True)
            # unread = NotificationSerializer(Notification.objects.all()
            #                                 .filter(type='R').filter(is_read=False).order_by('-created'), many=True)
        elif user_type == 'operations_manager':
            NotificationItems.get_om_repairs(user_id)
            NotificationItems.get_om_notifs(user_id)
            # notifications = NotificationSerializer(Notification.objects
            #                                        .filter(Q(type='I') | Q(type='R')).order_by('-created'), many=True)
            print(user_id)
            notifications = NotificationSerializer(Notification.objects.filter(user__id=user_id), many=True)

            unread = NotificationSerializer(Notification.objects.filter(user__id=user_id, is_read=False), many=True)
            print(unread)
        elif user_type == 'system_admin':
            NotificationItems.get_om_repairs(user_id)
            NotificationItems.get_om_notifs(user_id)

            # notifications = NotificationSerializer(Notification.objects
            #                                        .filter(Q(type='I') | Q(type='R')).order_by('-created'), many=True)
            print(user_id)
            notifications = NotificationSerializer(Notification.objects.filter(user__id=user_id), many=True)

            unread = NotificationSerializer(Notification.objects.filter(user__id=user_id, is_read=False), many=True)

        elif user_type == 'clerk':
            NotificationItems.get_om_notifs(user_id)
            NotificationItems.get_clerk_notifs(user_id)
            # notifications = NotificationSerializer(Notification.objects
            #                                        .filter(Q(type='I') | Q(type='R')).order_by('-created'), many=True)
            print(user_id)
            notifications = NotificationSerializer(Notification.objects.filter(user__id=user_id), many=True)
            unread = NotificationSerializer(Notification.objects.filter(user__id=user_id), many=True)

        elif user_type == 'mechanic':
            NotificationItems.get_mechanic_notifs(user_id)
            # notifications = NotificationSerializer(Notification.objects
            #                                        .filter(Q(type='I') | Q(type='R')).order_by('-created'), many=True)
            print(user_id)

            unread = NotificationSerializer(Notification.objects
                .filter(Q(type='I') | Q(type='R')).filter(is_read=False).order_by(
                '-created'), many=True)
            notifications = NotificationSerializer(Notification.objects
                .filter(Q(type='I') | Q(type='N')).filter(user__id=user_id).order_by(
                '-created'), many=True)
            unread = NotificationSerializer(Notification.objects
                .filter(Q(type='N') | Q(type='I')).filter(is_read=False).order_by(
                '-created'), many=True)

        elif user_type == 'driver':
            notifications = None
            unread = None

        return Response(data={
            'notifications': notifications.data if notifications is not None else [],
            'unread': unread.data,
        }, status=status.HTTP_200_OK)

    @staticmethod
    def is_time_between(begin_time, end_time, check_time=None):
        # If check time is not given, default to current UTC time
        check_time = datetime.now().time()
        if begin_time < end_time:
            return check_time >= begin_time and check_time <= end_time
        else:  # crosses midnight
            return check_time >= begin_time or check_time <= end_time

    @staticmethod
    def get_clerk_notifs(user_id):
        Notification.objects.filter(user__id=user_id,
                                    description="Please upload AM beep CSV").hard_delete()
        Notification.objects.filter(user__id=user_id,
                                    description="Please upload PM beep CSV").hard_delete()
        is_am = NotificationItems.is_time_between(time(4, 00), time(13, 59))
        is_pm = NotificationItems.is_time_between(time(14, 00), time(1, 00))
        beep_shift_am = BeepShift.objects.filter(date=datetime.now(), type='A')
        beep_shift_pm = BeepShift.objects.filter(date=datetime.now(), type='P')
        print(is_am)
        print(is_pm)
        print(f'the user id is {user_id}')

        if is_am and (len(beep_shift_am) == 0):
            notification = Notification.objects.filter(user__id=user_id,
                                                       description="Please upload AM beep CSV")
            if len(notification) == 0:
                notification = Notification.objects.create(
                    user=User.objects.get(pk=user_id),
                    type='R',
                    description='Please upload AM beep CSV'
                )
        elif is_pm and (len(beep_shift_pm) == 0):
            notification = Notification.objects.filter(user__id=user_id,
                                                       description="Please upload PM beep CSV")
            if len(notification) == 0:
                notification = Notification.objects.create(
                    user=User.objects.get(pk=user_id),
                    type='R',
                    description='Please upload PM beep CSV'
                )

        items = ItemRequest.objects.all()
        for item in items:
            notifs = Notification.objects.filter(user__id=user_id,
                                                 description=f"{item.category.category} is needed , {item.description}")
            if len(notifs) == 0:
                notification = Notification.objects.create(
                    user=User.objects.get(pk=user_id),
                    type='I',
                    description=f"{item.category.category} is needed , {item.description}"
                )
        return None

    @staticmethod
    def get_om_repairs(user_id):
        items = Repair.objects.filter(status="NS")
        # item2 = Repair.objects.filter(status="C")

        for item in items:
            notification = Notification.objects.filter(user__id=user_id,
                                                       description=f"{item.shuttle} has a pending repair request")
            if len(notification) == 0:
                notification = Notification.objects.create(
                    user=User.objects.get(pk=user_id),
                    type='I',
                    description=f"{item.shuttle} has a pending repair request"
                )

                # for item in item2:
                #     notification2 = Notification.objects.filter(user__id=user_id,
                #                                                 description=f"{item.shuttle} has been repaired")
                #     if len(notification2) == 0:
                #         Notification.objects.create(
                #             user=User.objects.get(pk=user_id),
                #             type='I',
                #             description=f"{item.shuttle} has been repaired"
                #         )

    @staticmethod
    def get_member_notifs(user):
        Notification.objects.filter(user__id=user['id']).hard_delete()
        member_id = user['id']
        shares = Share.objects.filter(member=Member.objects.get(pk=member_id))
        serialized_shares = ShareSerializer(shares, many=True)

        total_shares = sum([float(item["value"]) for item in serialized_shares.data])
        notification = Notification.objects.filter(user__id=user['id'],
                                                   description="You do not have enough accumulated shares")

        if total_shares < 50 and len(notification) == 0:
            notification = Notification.objects.create(
                user=User.objects.get(pk=user['id']),
                type='M',
                description='You do not have enough accumulated shares'
            )
        return notification

    @staticmethod
    def get_om_notifs(user_id):
        member_id = user_id
        # Notification.objects.filter(user__id=user_id).hard_delete()
        notification = None
        for item in ItemCategory.objects.all():
            if item.quantity < item.minimum_quantity:
                print(item.category + " - " + str(item.quantity) + " - " + str(item.minimum_quantity))
                notification = Notification.objects.filter(user__id=user_id,
                                                           description=f'{item.category} is low on stocks ({item.quantity} pcs)')
                if len(notification) == 0:
                    notification = Notification.objects.create(
                        user=User.objects.get(pk=user_id),
                        type='I',
                        description=f'{item.category} is low on stocks ({item.quantity} pcs)'
                    )
            else:
                notification = Notification.objects.filter(user__id=user_id,
                                                           description=f'{item.category} is low on stocks ({item.quantity} pcs)').hard_delete()

        return notification

    @staticmethod
    def get_mechanic_notifs(user_id):
        items = Repair.objects.filter(status="FI")
        item2 = Repair.objects.filter(status="IP")
        item3 = Repair.objects.filter(status="SR")

        for item in items:
            notification = Notification.objects.filter(user__id=user_id,
                                                       description=f"{item.shuttle} needs to be diagnosed for repair")
            if len(notification) == 0:
                notification = Notification.objects.create(
                    user=User.objects.get(pk=user_id),
                    type='I',
                    description=f"{item.shuttle} needs to be diagnosed for repair"
                )

        for item in item2:
            notification2 = Notification.objects.filter(user__id=user_id,
                                                        description=f"{item.shuttle} needs to be repaired")
            if len(notification2) == 0:
                Notification.objects.create(
                    user=User.objects.get(pk=user_id),
                    type='I',
                    description=f"{item.shuttle} needs to be repaired"
                )
        for item in item3:
            notification3 = Notification.objects.filter(user__id=user_id,
                                                        description=f"{item.shuttle} is scheduled to be repaired")
            if len(notification3) == 0:
                Notification.objects.create(
                    user=User.objects.get(pk=user_id),
                    type='I',
                    description=f"{item.shuttle} is scheduled to be repaired"
                )


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


class PassengerPerRoute(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        end_date = start_date + timedelta(days=7)

        values = []

        temp_date = start_date
        while temp_date < end_date:
            values.append({
                "day": temp_date.strftime("%A"),
                "main_road": PassengerPerRoute.getPassengersFromDate('M', temp_date),
                "kaliwa": PassengerPerRoute.getPassengersFromDate('L', temp_date),
                "kanan": PassengerPerRoute.getPassengersFromDate('R', temp_date),
                "threshold": 0
            })

            temp_date = temp_date + timedelta(days=1)

        return Response(data={
            "values": values
        }, status=status.HTTP_200_OK)

    @staticmethod
    def getPassengersFromDate(route, date):
        remittances = RemittanceForm.objects.filter(
            deployment__shift_iteration__date=date,
            deployment__route=route
        )

        print(remittances)
        amount = 0
        for remittance in remittances:
            consumed_tickets = ConsumedTicket.objects.filter(remittance_form=remittance)

            for consumed_ticket in consumed_tickets:
                if consumed_ticket.assigned_ticket.type is 'A':
                    price = 10
                elif consumed_ticket.assigned_ticket.type is 'B':
                    price = 12
                else:
                    price = 15

                amount += consumed_ticket.total / price

        return amount


class PeakHourReport(APIView):
    @staticmethod
    def get_passenger_per_hour(route, start_date, end_date, filter):
        print(start_date)
        print(end_date)
        one = 0
        two = 0
        three = 0
        four = 0
        five = 0
        six = 0
        seven = 0
        eight = 0
        nine = 0
        ten = 0
        eleven = 0
        twelve = 0
        thirteen = 0
        fourteen = 0
        fifteen = 0
        sixteen = 0
        seventeen = 0
        eighteen = 0
        nineteen = 0
        twenty = 0
        twentyone = 0
        twentytwo = 0
        twentythree = 0
        twentyfour = 0

        transactions = PeakHourReport.get_transactions(route, start_date, end_date, filter)

        for transaction in transactions:
            if transaction.transaction_date_time.hour == 1:
                one += 1
            elif transaction.transaction_date_time.hour == 2:
                two += 1
            elif transaction.transaction_date_time.hour == 3:
                three += 1
            elif transaction.transaction_date_time.hour == 4:
                four += 1
            elif transaction.transaction_date_time.hour == 5:
                five += 1
            elif transaction.transaction_date_time.hour == 6:
                six += 1
            elif transaction.transaction_date_time.hour == 7:
                seven += 1
            elif transaction.transaction_date_time.hour == 8:
                eight += 1
            elif transaction.transaction_date_time.hour == 9:
                nine += 1
            elif transaction.transaction_date_time.hour == 10:
                ten += 1
            elif transaction.transaction_date_time.hour == 11:
                eleven += 1
            elif transaction.transaction_date_time.hour == 12:
                twelve += 1
            elif transaction.transaction_date_time.hour == 13:
                thirteen += 1
            elif transaction.transaction_date_time.hour == 14:
                fourteen += 1
            elif transaction.transaction_date_time.hour == 15:
                fifteen += 1
            elif transaction.transaction_date_time.hour == 16:
                sixteen += 1
            elif transaction.transaction_date_time.hour == 17:
                seventeen += 1
            elif transaction.transaction_date_time.hour == 18:
                eighteen += 1
            elif transaction.transaction_date_time.hour == 19:
                nineteen += 1
            elif transaction.transaction_date_time.hour == 20:
                twenty += 1
            elif transaction.transaction_date_time.hour == 21:
                twentyone += 1
            elif transaction.transaction_date_time.hour == 22:
                twentytwo += 1
            elif transaction.transaction_date_time.hour == 23:
                twentythree += 1
            elif transaction.transaction_date_time.hour == 24:
                twentyfour += 1

        return [one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen,
                fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty, twentyone,
                twentytwo, twentythree, twentyfour]

    @staticmethod
    def get_transactions(route, start_date, end_date, filter):
        if filter == "All":
            return BeepTransaction.objects.filter(shuttle__route=route, transaction_date_time__gte=start_date,
                                                  transaction_date_time__lte=end_date)
        elif filter == "Mon":
            transactions = BeepTransaction.objects.filter(shuttle__route=route, transaction_date_time__gte=start_date,
                                                          transaction_date_time__lte=end_date)
            transactions = [item for item in transactions if item.transaction_date_time.weekday() == 0]
            return transactions
        elif filter == "Tue":
            transactions = BeepTransaction.objects.filter(shuttle__route=route, transaction_date_time__gte=start_date,
                                                          transaction_date_time__lte=end_date)
            transactions = [item for item in transactions if item.transaction_date_time.weekday() == 1]
            return transactions
        elif filter == "Wed":
            transactions = BeepTransaction.objects.filter(shuttle__route=route, transaction_date_time__gte=start_date,
                                                          transaction_date_time__lte=end_date)
            transactions = [item for item in transactions if item.transaction_date_time.weekday() == 2]
            return transactions
        elif filter == "Thu":
            transactions = BeepTransaction.objects.filter(shuttle__route=route, transaction_date_time__gte=start_date,
                                                          transaction_date_time__lte=end_date)
            transactions = [item for item in transactions if item.transaction_date_time.weekday() == 3]
            return transactions
        elif filter == "Fri":
            transactions = BeepTransaction.objects.filter(shuttle__route=route, transaction_date_time__gte=start_date,
                                                          transaction_date_time__lte=end_date)
            transactions = [item for item in transactions if item.transaction_date_time.weekday() == 4]
            return transactions
        elif filter == "Sat":
            transactions = BeepTransaction.objects.filter(shuttle__route=route, transaction_date_time__gte=start_date,
                                                          transaction_date_time__lte=end_date)
            transactions = [item for item in transactions if item.transaction_date_time.weekday() == 5]
            return transactions
        elif filter == "Sun":
            transactions = BeepTransaction.objects.filter(shuttle__route=route, transaction_date_time__gte=start_date,
                                                          transaction_date_time__lte=end_date)
            transactions = [item for item in transactions if item.transaction_date_time.weekday() == 6]
            return transactions

    @staticmethod
    def post(request):
        data = json.loads(request.data)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        filter = data['filter']
        end_date = start_date + timedelta(days=7)
        week2 = end_date + timedelta(days=1)
        week2_end = week2 + timedelta(days=7)
        week3 = week2_end + timedelta(days=1)
        week3_end = week3 + timedelta(days=7)
        week4 = week3_end + timedelta(days=1)
        week4_end = week4 + timedelta(days=7)

        week1_main_road_values = PeakHourReport.get_passenger_per_hour('M', start_date, end_date, filter)
        week1_kaliwa_values = PeakHourReport.get_passenger_per_hour('L', start_date, end_date, filter)
        week1_kanan_values = PeakHourReport.get_passenger_per_hour('R', start_date, end_date, filter)

        week2_main_road_values = PeakHourReport.get_passenger_per_hour('M', week2, week2_end, filter)
        week2_kaliwa_values = PeakHourReport.get_passenger_per_hour('L', week2, week2_end, filter)
        week2_kanan_values = PeakHourReport.get_passenger_per_hour('R', week2, week2_end, filter)

        week3_main_road_values = PeakHourReport.get_passenger_per_hour('M', week3, week3_end, filter)
        week3_kaliwa_values = PeakHourReport.get_passenger_per_hour('L', week3, week3_end, filter)
        week3_kanan_values = PeakHourReport.get_passenger_per_hour('R', week3, week3_end, filter)

        week4_main_road_values = PeakHourReport.get_passenger_per_hour('M', week4, week4_end, filter)
        week4_kaliwa_values = PeakHourReport.get_passenger_per_hour('L', week4, week4_end, filter)
        week4_kanan_values = PeakHourReport.get_passenger_per_hour('R', week4, week4_end, filter)

        return Response(data={
            "week1_main_road_values": week1_main_road_values,
            "week1_kaliwa_values": week1_kaliwa_values,
            "week1_kanan_values": week1_kanan_values,
            "week2_main_road_values": week2_main_road_values,
            "week2_kaliwa_values": week2_kaliwa_values,
            "week2_kanan_values": week2_kanan_values,
            "week3_main_road_values": week3_main_road_values,
            "week3_kaliwa_values": week3_kaliwa_values,
            "week3_kanan_values": week3_kanan_values,
            "week4_main_road_values": week4_main_road_values,
            "week4_kaliwa_values": week4_kaliwa_values,
            "week4_kanan_values": week4_kanan_values,
            "start_date": start_date.date(),
            "end_date": week4_end.date(),
        }, status=status.HTTP_200_OK)


#
# class RemittancePerMonth(APIView):
#     @staticmethod
#     def get(request):
#         pass


class DriverPerformance(APIView):
    @staticmethod
    def post(request):
        start_date = datetime.strptime(request.data["start_date"], '%Y-%m-%d')
        if "end_date" in request.data:
            end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
        else:
            end_date = start_date + timedelta(days=6)

        data = []
        print(start_date)
        print(end_date)
        sub_freq_total = 0
        absences_total = 0
        remittance_total = 0
        payables_total = 0
        lates_total = 0
        discrepancy_frequency_total = 0

        for driver in Driver.objects.all().order_by('name'):
            remittances = RemittanceForm.objects.filter(deployment__driver=driver,
                                                        deployment__shift_iteration__date__gte=start_date,
                                                        deployment__shift_iteration__date__lte=end_date)
            print(len(remittances))
            sub_freq = len(SubbedDeployments.objects.filter(deployment__driver=driver,
                                                            deployment__shift_iteration__date__gte=start_date,
                                                            deployment__shift_iteration__date__lte=end_date))
            absences = len(SubbedDeployments.objects.filter(absent_driver__driver=driver,
                                                            deployment__shift_iteration__date__gte=start_date,
                                                            deployment__shift_iteration__date__lte=end_date))
            total = sum([item.total for item in remittances])
            payables = sum([item.discrepancy for item in remittances])
            discrepancy_frequency = len([item.discrepancy for item in remittances if item.discrepancy > 0])
            lates = 0

            for item in remittances:
                driver_assigned = DriversAssigned.objects.filter(shift__schedule__start_date__gte=start_date,
                                                                 shift__schedule__end_date__lte=end_date).first()
                shift_type = item.deployment.shift_iteration.shift.type
                deployment_type = 'R'

                if driver_assigned is not None:
                    shift_type = driver_assigned.shift.type
                    deployment_type = driver_assigned.deployment_type

                    print(shift_type)
                    print(deployment_type)

                expected_arrival = None
                if shift_type == "A" and (deployment_type == "Regular" or deployment_type == "R"):
                    expected_arrival = item.deployment.start_time.replace(hour=5, minute=0, second=0, microsecond=0)
                if shift_type == "A" and (deployment_type == "Early" or deployment_type == "E"):
                    expected_arrival = item.deployment.start_time.replace(hour=4, minute=30, second=0, microsecond=0)
                if shift_type == "P" and (deployment_type == "Regular" or deployment_type == "R"):
                    expected_arrival = item.deployment.start_time.replace(hour=14, minute=0, second=0, microsecond=0)
                if shift_type == "P" and (deployment_type == "Late" or deployment_type == "L"):
                    expected_arrival = item.deployment.start_time.replace(hour=16, minute=0, second=0, microsecond=0)

                print(shift_type)
                print(deployment_type)
                print(item.deployment.start_time)
                print(expected_arrival)
                if item.deployment.start_time > expected_arrival:
                    lates += 1

            sub_freq_total += sub_freq
            absences_total += absences
            remittance_total += total
            payables_total += payables
            lates_total += lates
            discrepancy_frequency_total += discrepancy_frequency

            data.append({
                "driver": DriverSerializer(driver).data,
                "remittance": "{0:,.2f}".format(total),
                "payables": "{0:,.2f}".format(payables),
                "discrepancy_freq": discrepancy_frequency,
                "sub_freq": sub_freq,
                "absences": absences,
                "lates": lates,
            })

        print(data)
        return Response(data={
            "start_date": start_date.date(),
            "end_date": end_date.date(),
            "data": data,
            "payables_total": "{0:,.2f}".format(payables_total),
            "lates_total": lates_total,
            "absences_total": absences_total,
            "sub_freq_total": sub_freq_total,
            "remittance_total": "{0:,.2f}".format(remittance_total),
            "discrepancy_freq_total": discrepancy_frequency_total
        }, status=status.HTTP_200_OK)


class RemittancePerYear(APIView):
    @staticmethod
    def post(request):
        print("enters here")
        data = json.loads(request.body)
        # date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        date = datetime(data["start_date"], 1, 1)
        end_date = datetime(date.year, 12, 31)

        year = date.year
        month = date.month
        num_days = calendar.monthrange(year, month)[1]
        temp_date = end_date
        years = []
        for x in range(0, 4):
            months = []
            days = 365 * x
            for i in range(1, 13):
                filter_date = (date - timedelta(days=days)).year
                total = RemittancePerYear.get_total(
                    BeepTransaction.objects.filter(transaction_date_time__year=filter_date,
                                                   transaction_date_time__month=i))
                total = sum([item.total for item in
                             RemittanceForm.objects.filter(
                                 deployment__shift_iteration__date__year=filter_date,
                                 deployment__shift_iteration__date__month=i)]) + total

                # + sum([item.total for item in
                #        BeepTransaction.objects.filter(
                #            transaction_date_time__year=(
                #                date - timedelta(
                #                    days=days)).year,
                #            transaction_date_time__month=i)])
                months.append("{0:,.2f}".format(total))
            years.append({
                "year": (date - timedelta(days=days)).year,
                "months": months,
            })
        january = 0
        february = 0
        march = 0
        april = 0
        may = 0
        june = 0
        july = 0
        august = 0
        september = 0
        october = 0
        november = 0
        december = 0
        for item in years:
            january += float(item["months"][0].replace(',', ''))
            february += float(item["months"][1].replace(',', ''))
            march += float(item["months"][2].replace(',', ''))
            april += float(item["months"][3].replace(',', ''))
            may += float(item["months"][4].replace(',', ''))
            june += float(item["months"][5].replace(',', ''))
            july += float(item["months"][6].replace(',', ''))
            august += float(item["months"][7].replace(',', ''))
            september += float(item["months"][8].replace(',', ''))
            october += float(item["months"][9].replace(',', ''))
            november += float(item["months"][10].replace(',', ''))
            december += float(item["months"][11].replace(',', ''))

        year1 = 0
        for item in years[0]["months"]:
            year1 += float(item.replace(',', ''))

        year2 = 0
        for item in years[1]["months"]:
            year2 += float(item.replace(',', ''))
        year3 = 0
        for item in years[2]["months"]:
            year3 += float(item.replace(',', ''))
        year4 = 0
        for item in years[2]["months"]:
            year4 += float(item.replace(',', ''))
        data = {
            "start_date": years[0]['year'],
            "end_date": years[3]['year'],
            "years": years,
            "jan": "{0:,.2f}".format(january),
            "feb": "{0:,.2f}".format(february),
            "mar": "{0:,.2f}".format(march),
            "apr": "{0:,.2f}".format(april),
            "may": "{0:,.2f}".format(may),
            "june": "{0:,.2f}".format(june),
            "july": "{0:,.2f}".format(july),
            "aug": "{0:,.2f}".format(august),
            "sept": "{0:,.2f}".format(september),
            "oct": "{0:,.2f}".format(october),
            "nov": "{0:,.2f}".format(november),
            "dec": "{0:,.2f}".format(december),
            "jan_average": "{0:,.2f}".format(january / 4),
            "feb_average": "{0:,.2f}".format(february / 4),
            "mar_average": "{0:,.2f}".format(march / 4),
            "apr_average": "{0:,.2f}".format(april / 4),
            "may_average": "{0:,.2f}".format(may / 4),
            "june_average": "{0:,.2f}".format(june / 4),
            "july_average": "{0:,.2f}".format(july / 4),
            "aug_average": "{0:,.2f}".format(august / 4),
            "sept_average": "{0:,.2f}".format(september / 4),
            "oct_average": "{0:,.2f}".format(october / 4),
            "nov_average": "{0:,.2f}".format(november / 4),
            "dec_average": "{0:,.2f}".format(december / 4),
            "year4": "{0:,.2f}".format(year1),
            "year3": "{0:,.2f}".format(year2),
            "year2": "{0:,.2f}".format(year3),
            "year1": "{0:,.2f}".format(year4),
            "grand_total": "{0:,.2f}".format(
                january + february + march + april + may + june + july + august + september + october + november + december)
        }

        return Response(data=data, status=status.HTTP_200_OK)

    @staticmethod
    def get_total(set):
        total = 0
        for item in set:
            total += item.total
        return total
