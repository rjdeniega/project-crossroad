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

# Create your views here.
from core.serializers import UserSerializer, PersonSerializer
from members.models import Person


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
        print(user is None)
        if user is None:
            return Response(data={
                "error": "Invalid credentials"
            }, status=401)

        if Token.objects.filter(user=user).count() == 1:
            token = Token.objects.get(user=user)
        else:
            token = Token.objects.create(user=user)
        # try:
        #     user_type = user.groups.all()[0].name
        # except:
        #     user_type = 'Not Set'

        return Response(data={
            "token": token.key,
            "user": model_to_dict(user),
        }, status=200)


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
        print(json.loads(request.body))
        if "username" not in request.data or "password" not in request.data:
            return Response(data={
                "error": "Missing username or password"
            }, status=400)
        user = User()
        user.username = request.data.get('username')
        user.password = request.data.get('password')
        data = json.loads(request.body)
        person_serializer = PersonSerializer(data=data)
        if person_serializer.is_valid():
            # TODO add end shift
            person = person_serializer.create(validated_data=person_serializer.validated_data)
            return Response(data={
                'person': model_to_dict(person)
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": person_serializer.errors
            })


class UserHandler(APIView):
    @staticmethod
    def post(request):
        # check if username is taken
        print("enters here")
        print(request.data)
        if "username" not in request.data or "password" not in request.data:
            return Response(data={
                "error": "Missing username or password"
            }, status=400)
        username = request.data["username"]
        existing_usernames = [user.username for user in User.objects.all()]

        if username in existing_usernames:
            print(existing_usernames)
            return Response(data={
                "error": "Username already exists"
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
