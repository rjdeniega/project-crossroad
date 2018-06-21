from rest_framework.serializers import ModelSerializer
from .models import *


class DriverSerializer(ModelSerializer):
    class Meta:
        # these are the settings that come with the class
        # we specify that this serializes the driver class
        # and we want all fields to be included

        model = Driver
        fields = "__all__"

    # def create(self, validated_data):
    #     # this overrides the parent class' create function
    #     # by default, it takes in the model's (in this case Driver) --
    #     # fields and creates an object


class PersonSerializer(ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'


class MemberSerializer(ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'
