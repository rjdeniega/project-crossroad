from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer

from members.models import Person


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "username,password,user_type"


class PersonSerializer(ModelSerializer):
    class Meta:
        model = Person
        fields = "__all__"
