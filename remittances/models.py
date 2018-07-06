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
    start_date = DateField()
    end_date = DateField()


class DriversAssigned(SoftDeletionModel):
    driver = ForeignKey(Driver, on_delete=models.CASCADE)
    shift = ForeignKey(Shift, on_delete=models.CASCADE)


class Deployment(SoftDeletionModel):
    driver = ForeignKey(Driver, on_delete=models.CASCADE)
    route = CharField(max_length=1, choices=ROUTE)
    shift = ForeignKey(Shift, on_delete=models.CASCADE)
    status = CharField(max_length=1, choices=DEPLOYMENT_STATUS)


class AssignedTicket(SoftDeletionModel):
    deployment = ForeignKey(Deployment, related_name="assigned_tickets", on_delete=models.CASCADE)
    range_from = IntegerField()
    range_to = IntegerField()
    type = CharField(max_length=1, choices=TICKET_TYPE)

    def __str__(self):
        return self.get_type_display() + ": " + str(self.range_from) + " - " + str(self.range_to)


class VoidTicket(SoftDeletionModel):
    assigned_ticket = ForeignKey(AssignedTicket, on_delete=models.CASCADE)
    ticket_number = IntegerField()


class RemittanceForm(SoftDeletionModel):
    deployment = ForeignKey(Deployment, on_delete=models.CASCADE)
    fuel_cost = DecimalField(null=True, max_digits=19, decimal_places=10)
    other_cost = DecimalField(null=True, max_digits=19, decimal_places=10)
    status = CharField(max_length=1, choices=FORM_STATUS, default='P')
    total = DecimalField(max_digits=19, decimal_places=10) # income - costs


class ConsumedTicket(SoftDeletionModel):
    remittance_form = ForeignKey(RemittanceForm, on_delete=models.CASCADE)
    assigned_ticket = ForeignKey(AssignedTicket, on_delete=models.CASCADE)
    end_ticket = IntegerField()
    total = DecimalField(null=True, max_digits=19, decimal_places=10)


