from datetime import datetime

from django.core import serializers
from django.http import JsonResponse
from django.shortcuts import render
import rest_framework
from django.contrib.auth import authenticate, login
from django.shortcuts import get_object_or_404
from django.views import View
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
import json
from django.contrib.auth.models import User
from rest_framework import status
from django.forms.models import model_to_dict
from members.models import *

# Create your views here.
from core.serializers import UserSerializer, PersonSerializer
from members.models import Person, Driver, Supervisor, OperationsManager, Clerk
from members.serializers import DriverSerializer, SupervisorSerializer, OperationsManagerSerializer, ClerkSerializer, \
    MemberSerializer, MechanicSerializer, ShareSerializer
from remittances.models import Deployment, RemittanceForm, BeepTransaction, BeepShift, CarwashTransaction
from remittances.serializers import BeepTransactionSerializer, CarwashTransactionSerializer
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
            "photo": request.FILES.get('image')
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
            member = Member.objects.create(**data)
            id_card = IDCards()
            id_card.member = member
            id_card.register_date = datetime.now().date()
            id_card.can = card_number
            id_card.save()
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

            report_items.append({
                "member": MemberSerializer(member).data,
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
                transactions = BeepTransaction.objects.filter(card_number=id_card.can)
                carwash_transactions = [CarwashTransactionSerializer(item).data for item in
                                        CarwashTransaction.objects.all() if item.member == member]
                print(transactions)
                serialized_transactions = [BeepTransactionSerializer(item).data for item in transactions]
                for item in serialized_transactions:
                    item["shift_date"] = BeepShift.objects.get(pk=item["shift"]).date
                report_items.append({
                    "member": MemberSerializer(member).data,
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
                transactions = BeepTransaction.objects.filter(card_number=id_card.can)
                carwash_transactions = [item for item in
                                        CarwashTransaction.objects.all() if item.member == member]
                if end_date is not None:
                    transactions = [item for item in transactions if start_date.date() <= item.shift.date <= end_date.date()]
                    carwash_transactions = [CarwashTransactionSerializer(item).data for item in carwash_transactions if
                                            start_date.date() <= item.date <= end_date.date()]
                else:
                    print(start_date.date())
                    print(carwash_transactions[0].date)
                    print(start_date.date() == carwash_transactions[0].date)
                    transactions = [item for item in transactions if start_date.date() == item.shift.date]
                    carwash_transactions = [CarwashTransactionSerializer(item).data for item in carwash_transactions if
                                            start_date.date() == item.date]

                serialized_transactions = BeepTransactionSerializer(transactions, many=True)
                for item in serialized_transactions.data:
                    item["shift_date"] = BeepShift.objects.get(pk=item["shift"]).date

                report_items.append({
                    "member": MemberSerializer(member).data,
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
            share_updates = Share.objects.filter(member=member.id)

            if end_date is not None:
                share_updates = [item for item in share_updates if start_date.date() <= item.date_of_update <= end_date.date()]
            else:
                share_updates = [item for item in share_updates if start_date.date() == item.date_of_update]

            report_items.append({
                "member": MemberSerializer(member).data,
                "share_updates": share_updates
            })

        return Response(data={
            "report_items": report_items
        }, status=status.HTTP_200_OK)