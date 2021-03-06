from django.contrib.auth.models import User
from django.db import models
from core.models import SoftDeletionModel
from django.db.models import *
from django.db.models.aggregates import Count
from random import randint

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
    photo = FileField(default='client/src/images/default.png', null=True)

    def __str__(self):
        return (str(self.id) + " - " + self.name)

    def random(self):
        count = self.aggregate(count=Count('id'))['count']
        random_index = randint(0, count - 1)
        return self.all()[random_index]

    def get_user_type(self):
        return self.user_type

    @property
    def formatted_name(self):
        name = self.name
        name = name.split()
        return f'{name[1], name[0]}'
    @property
    def last_name(self):
        name = self.name
        name = name.split()
        return name[1]

    @property
    def first_name(self):
        name = self.name
        name = name.split()
        return name[0]

class Driver(Person):
    user = ForeignKey(User, on_delete=models.CASCADE, null=True)
    remaining_tickets = PositiveIntegerField(default=0)
    is_supervisor = BooleanField(default=False)
    application_date = DateField()

    def random(self):
        count = self.aggregate(count=Count('id'))['count']
        random_index = randint(0, count - 1)
        return self.all()[random_index]


class Clerk(Person):
    user = ForeignKey(User, on_delete=models.CASCADE, null=True)
    application_date = DateField()


class Mechanic(Person):
    user = ForeignKey(User, on_delete=models.CASCADE, null=True)
    application_date = DateField()


class OperationsManager(Person):
    user = ForeignKey(User, on_delete=models.CASCADE, null=True)
    application_date = DateField()


class Supervisor(Person):
    user = ForeignKey(User, on_delete=models.CASCADE, null=True)
    application_date = DateField()


class Member(Person):
    user = ForeignKey(User, on_delete=models.CASCADE, null=True)
    tin_number = PositiveIntegerField()
    accepted_date = DateField()
    civil_status = CharField(max_length=1, choices=CV_STATUS)
    educational_attainment = CharField(max_length=1, choices=EDUCATIONAL_ATTAINMENT)
    occupation = CharField(max_length=64)
    no_of_dependents = PositiveIntegerField()
    religion = CharField(max_length=64)
    annual_income = PositiveIntegerField()  # TODO replace with ranges
    termination_date = DateField(null=True)

    @property
    def id_cards(self):
        return self.idcards_set


class IDCards(SoftDeletionModel):
    member = ForeignKey(Member, on_delete=models.CASCADE)
    can = PositiveIntegerField()
    register_date = DateField()


class Prospect(Person):
    can = PositiveIntegerField()


class Share(SoftDeletionModel):
    member = ForeignKey(Member, on_delete=models.CASCADE)
    value = DecimalField(max_digits=6, decimal_places=2)
    date_of_update = DateField(null=True)
    photo = FileField(default='client/src/images/default.png', null=True)
    receipt = CharField(max_length=64)

    def get_total(self):
        return self.item_set.all().aggregate(Sum('value'))


class ShareCertificate(SoftDeletionModel):
    member = ForeignKey(Member, on_delete=models.CASCADE)
    serial_number = CharField(max_length=64)
    quantity = PositiveIntegerField()
    date_created = DateField()
    date_issued = DateField()  # date when it was actually given to the member; NOT SURE IF THIS IS NEEDED
