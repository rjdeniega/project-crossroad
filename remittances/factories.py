import factory.django
from datetime import timedelta
from remittances.models import *
from django.contrib.auth.models import User

class ScheduleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Schedule
