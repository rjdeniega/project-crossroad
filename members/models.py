from django.contrib.auth.models import User
from django.db import models
from core.models import SoftDeletionModel
from django.db.models import *

# Create your models here.

CV_STATUS = [
    ('S', 'Single'),
    ('M', 'Married')
]
EDUCATIONAL_ATTAINMENT = [
    ('P', 'Preschool'),
    ('E', 'Elementary'),
    ('H', 'High School'),
    ('V', 'Vocational'),
    ('B', 'Bachelors Degree'),
    ('M', 'Masters Degree'),
    ('D', 'Doctorate')
]
SEX = [
    ('M', 'Male'),
    ('F', 'Female')
]


class Person(SoftDeletionModel):
    name = CharField(max_length=64)
    email = CharField(blank=True, null=True, max_length=64)
    contact_no = PositiveIntegerField()
    address = CharField(max_length=256)
    birth_date = DateField()
    sex = CharField(max_length=1, choices=SEX)


class Driver(Person):
    user = OneToOneField(User, on_delete=models.CASCADE, null=True)
    application_date = DateField()


class Member(Person):
    user = OneToOneField(User, on_delete=models.CASCADE, null=True)
    tin_number = PositiveIntegerField()
    accepted_date = DateField()
    civil_status = CharField(max_length=1, choices=CV_STATUS)
    educational_attainment = CharField(max_length=1, choices=EDUCATIONAL_ATTAINMENT)
    occupation = CharField(max_length=64)
    no_of_dependents = PositiveIntegerField()
    religion = CharField(max_length=64)
    annual_income = PositiveIntegerField()  # TODO replace with ranges
    termination_date = DateField()
    BOD_resolution = CharField(max_length=64)

    @property
    def id_cards(self):
        return self.idcards_set


class IDCards(SoftDeletionModel):
    member = ForeignKey(Member, on_delete=models.CASCADE)
    can = PositiveIntegerField()
    register_date = DateField()


class Prospect(Person):
    can = PositiveIntegerField()
