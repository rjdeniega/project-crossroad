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


# Create your views here.
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

        print(token.user, user)
        try:
            user_type = user.groups.all()[0].name
        except:
            user_type = 'Not Set'

        return Response(data={
            "token": token.key,
            "username": username,
            "user_type": user_type
        }, status=200)
