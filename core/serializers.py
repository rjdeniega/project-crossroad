from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer

from members.models import Person
from core.models import Notification

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class PersonSerializer(ModelSerializer):
    class Meta:
        model = Person
        fields = "__all__"


class NotificationSerializer(ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"