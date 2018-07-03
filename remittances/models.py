from django.db import models
from django.db.models import *
from core.models import SoftDeletionModel
from members.models import *

# Create your models here.
TICKET_TYPE = [
    ('A', '9 Pesos'),
    ('B', '11 Pesos'),
    ('C', '13 Pesos')
]

ROUTE = [
    ('M', 'Main Road'),
    ('R', 'Right Route'), #Kanan
    ('L', 'Left Route') #Kaliwa
]

SHIFT = [
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


class Deployment(SoftDeletionModel):
    driver = ForeignKey(Driver, on_delete=models.CASCADE)
    route = CharField(max_length=1, choices=ROUTE)
    shift = CharField(max_length=1, choices=SHIFT)
    status = CharField(max_length=1, choices=DEPLOYMENT_STATUS)
    date = DateField(auto_now_add=True)


class AssignedTicket(SoftDeletionModel):
    deployment = ForeignKey(Deployment, on_delete=models.CASCADE)
    range_from = IntegerField()
    range_to = IntegerField()
    type = CharField(max_length=1, choices=TICKET_TYPE)


class VoidTicket(SoftDeletionModel):
    ticket_number = CharField(max_length=64)
    assigned_ticket = ForeignKey(AssignedTicket, on_delete=models.CASCADE)


class RemittanceForm(SoftDeletionModel):
    deployment = ForeignKey(Deployment, on_delete=models.CASCADE)
    fuel_cost = DecimalField(null=True, max_digits=19, decimal_places=10)
    other_cost = DecimalField(null=True, max_digits=19, decimal_places=10)
    total = DecimalField(max_digits=19, decimal_places=10)
    status = CharField(max_length=1, choices=FORM_STATUS, default='P')


class ConsumedTickets(SoftDeletionModel):
    assigned_ticket = ForeignKey(AssignedTicket, on_delete=models.CASCADE)
    remittance_form = ForeignKey(RemittanceForm, on_delete=models.CASCADE)
    range_from = IntegerField()
    range_to = IntegerField()
    total = DecimalField(max_digits=19, decimal_places=10)

