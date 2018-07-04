from django.db import models
from django.db.models import *
from core.models import SoftDeletionModel
from members.models import *

# Create your models here.
TICKET_TYPE = [
    ('A', '9 Pesos'),
    ('B', '11 Pesos'),
    ('C', '14 Pesos')
]

ROUTE = [
    ('M', 'Main Road'),
    ('R', 'Right Route'), #Kanan
    ('L', 'Left Route') #Kaliwa
]

SHIFT_TYPE = [
    ('A', 'AM Shift'),
    ('P', 'PM Shift'),
    ('M', 'Midnight Shift')
]

DEPLOYMENT_STATUS = [
    ('O', 'Ongoing'),
    ('F', 'Finished')
]

FORM_STATUS = [
    ('P', 'Pending'),
    ('C', 'Completed')
]

class Shift(SoftDeletionModel):
    type = CharField(max_length=1, choices=SHIFT_TYPE)
    date = DateField(auto_now_add=True)

class Deployment(SoftDeletionModel):
    driver = ForeignKey(Driver, on_delete=models.CASCADE)
    route = CharField(max_length=1, choices=ROUTE)
    shift = ForeignKey(Shift, on_delete=models.CASCADE)
    status = CharField(max_length=1, choices=DEPLOYMENT_STATUS)
    # 9 Pesos
    a_range_from = IntegerField()
    a_range_to = IntegerField()
    # 11 Pesos
    b_range_from = IntegerField()
    b_range_to = IntegerField()
    # 14 Pesos
    c_range_from = IntegerField()
    c_range_to = IntegerField()


class VoidTicket(SoftDeletionModel):
    ticket_number = CharField(max_length=64)
    deployment = ForeignKey(Deployment, on_delete=models.CASCADE)


class RemittanceForm(SoftDeletionModel):
    deployment = ForeignKey(Deployment, on_delete=models.CASCADE)
    fuel_cost = DecimalField(null=True, max_digits=19, decimal_places=10)
    other_cost = DecimalField(null=True, max_digits=19, decimal_places=10)
    status = CharField(max_length=1, choices=FORM_STATUS, default='P')
    # Consumed Tickets Fields
    a_end = IntegerField()
    a_total = DecimalField(null=True, max_digits=19, decimal_places=10)
    b_end = IntegerField()
    b_total = DecimalField(null=True, max_digits=19, decimal_places=10)
    c_end = IntegerField()
    c_total = DecimalField(null=True, max_digits=19, decimal_places=10)
    total = DecimalField(max_digits=19, decimal_places=10) # income - costs


