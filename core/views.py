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
from PIL import Image

# Create your views here.
from core.serializers import UserSerializer, PersonSerializer
from members.models import Person, Driver, Supervisor, OperationsManager, Clerk
from members.serializers import DriverSerializer, SupervisorSerializer, OperationsManagerSerializer, ClerkSerializer


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
            # if user in [clerkuser for clerk in Clerk.objects.all()]:
            #     return "supervisor"

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
            "email": request.POST.get('password'),
            "user": user,
            "sex": request.POST.get('sex'),
            "address": request.POST.get('address'),
            "contact_no": request.POST.get('contact_no'),
            "birth_date": request.POST.get('birth_date'),
            "application_date": request.POST.get('application_date'),
            "photo": request.FILES.get('image')
        }
        user_staff = CreateUserView.create_user_type(user_type, data)
        # user_staff.photo = Image.open(photo)
        # user_staff.save()
        instance = CreateUserView.get_serialized_data(user_type, user_staff)
        return Response(data={
            "user_staff": instance.data,
            "user": model_to_dict(user)
        }, status=200, content_type="application/json")

    @staticmethod
    def create_user_type(user_type, data):
        if user_type == "Driver":
            return Driver.objects.create(**data)
        if user_type == "Clerk":
            return Clerk.objects.create(**data)
        if user_type == "OM":
            return OperationsManager.objects.create(**data)
        if user_type == "Supervisor":
            return Supervisor.objects.create(**data)

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
