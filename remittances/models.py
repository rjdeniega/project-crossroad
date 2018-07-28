from django.db import models
from django.db.models import *
from django.utils import timezone
from datetime import datetime
from core.models import SoftDeletionModel
from members.models import *
from inventory.models import *

# Create your models here.
TICKET_TYPE = [
    ('A', '10 Pesos'),
    ('B', '12 Pesos'),
    ('C', '15 Pesos')
]
ROUTE = [
    ('M', 'Main Road'),
    ('R', 'Right Route'),  # Kanan
    ('L', 'Left Route')  # Kaliwa
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

ITERATION_STATUS = [
    ('O', 'Ongoing'),
    ('F', 'Finished')
]


class Schedule(SoftDeletionModel):
    start_date = DateField()
    end_date = DateField(null=True)
    created = models.DateTimeField(editable=False)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Schedule, self).save(*args, **kwargs)

    def create(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Schedule, self).save(*args, **kwargs)


class Shift(SoftDeletionModel):
    type = CharField(max_length=1, choices=SHIFT_TYPE)
    supervisor = ForeignKey(Supervisor, on_delete=models.CASCADE)
    schedule = ForeignKey(Schedule, on_delete=models.CASCADE)
    created = models.DateTimeField(editable=False)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Shift, self).save(*args, **kwargs)


class DriversAssigned(SoftDeletionModel):
    driver = ForeignKey(Driver, related_name='driver_name', on_delete=models.CASCADE)
    shuttle = ForeignKey(Shuttle, on_delete=models.CASCADE)
    shift = ForeignKey(Shift, on_delete=models.CASCADE)


class ShiftIteration(SoftDeletionModel):
    shift = ForeignKey(Shift, on_delete=models.CASCADE)
    date = DateField(auto_now_add=True)
    status = CharField(max_length=1, choices=ITERATION_STATUS, default='O')

    def finish_shift(self):
        self.status = 'F'
        self.save()


class Deployment(SoftDeletionModel):
    driver = ForeignKey(Driver, on_delete=models.CASCADE)
    route = CharField(max_length=1, choices=ROUTE)
    shift_iteration = ForeignKey(ShiftIteration, on_delete=models.CASCADE)
    status = CharField(max_length=1, choices=DEPLOYMENT_STATUS, default='O')
    start_time = DateTimeField(default=datetime.now(), editable=False)
    end_time = DateTimeField(null=True)
    created = models.DateTimeField(editable=False)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Deployment, self).save(*args, **kwargs)

    def end_deployment(self):
        self.end_time = datetime.now()
        self.save()


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
    fuel_cost = DecimalField(default=0, max_digits=19, decimal_places=10)
    other_cost = DecimalField(default=0, max_digits=19, decimal_places=10)
    status = CharField(max_length=1, choices=FORM_STATUS, default='P')
    total = DecimalField(default=0, max_digits=19, decimal_places=10)  # income - costs
    km_from = DecimalField(default=0, max_digits=19, decimal_places=10)
    km_to = DecimalField(default=0, max_digits=19, decimal_places=10)
    discrepancy = DecimalField(default=0, max_digits=19, decimal_places=10)
    created = models.DateTimeField(editable=False)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(RemittanceForm, self).save(*args, **kwargs)

    def confirm_remittance(self):
        self.status = 'C'  # set status to confirmed
        self.save()


class ConsumedTicket(SoftDeletionModel):
    remittance_form = ForeignKey(RemittanceForm, on_delete=models.CASCADE)
    assigned_ticket = ForeignKey(AssignedTicket, on_delete=models.CASCADE)
    end_ticket = IntegerField()
    total = DecimalField(default=0, null=True, max_digits=19, decimal_places=10)


class BeepShift(SoftDeletionModel):
    type = CharField(max_length=1, choices=SHIFT_TYPE)
    date = DateField(null=True)


class BeepTransaction(SoftDeletionModel):
    shift = ForeignKey(BeepShift, on_delete=models.CASCADE, null=True)
    card_number = CharField(null=True, max_length=20)
    total = DecimalField(default=0, max_digits=19, decimal_places=10)