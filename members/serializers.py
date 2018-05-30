from rest_framework.serializers import ModelSerializer
from .models import *


class DriverSerializer(ModelSerializer):
    class Meta:
        model = Driver
        fields = "__all__"


class PersonSerializer(ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'
