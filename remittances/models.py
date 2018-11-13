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
]

DRIVER_DEPLOYMENT_TYPE = [
    'Early',
    'Regular',
    'Late'
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

    def get_status(self, current_schedule):
        if current_schedule is None:
            if self.start_date > datetime.today().date():
                return 'pending'
            elif self.end_date < datetime.today().date():
                return 'completed'

        if self.id == current_schedule.id:
            return 'current'
        elif self.start_date < current_schedule.start_date:
            return 'completed'
        else:
            return 'pending'


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
    deployment_type = CharField(max_length=16)
    shift = ForeignKey(Shift, on_delete=models.CASCADE)


class ShiftIteration(SoftDeletionModel):
    shift = ForeignKey(Shift, on_delete=models.CASCADE)
    date = DateField(auto_now_add=True)
    status = CharField(max_length=1, choices=ITERATION_STATUS, default='O')
    remarks = CharField(max_length=64, null=True)

    def finish_shift(self):
        self.status = 'F'
        self.save()


class Deployment(SoftDeletionModel):
    driver = ForeignKey(Driver, on_delete=models.CASCADE)
    shuttle = ForeignKey(Shuttle, on_delete=models.CASCADE)
    route = CharField(max_length=1, choices=ROUTE)
    shift_iteration = ForeignKey(ShiftIteration, on_delete=models.CASCADE)
    status = CharField(max_length=1, choices=DEPLOYMENT_STATUS, default='O')
    # start_time = DateTimeField(default=datetime.now(), editable=False)
    # end_time = DateTimeField(null=True)
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
    driver = ForeignKey(Driver, on_delete=models.CASCADE)
    range_from = IntegerField(null=True)
    range_to = IntegerField(null=True)
    type = CharField(max_length=1, choices=TICKET_TYPE)
    created = models.DateTimeField(editable=False, default=timezone.now())
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(AssignedTicket, self).save(*args, **kwargs)

    def __str__(self):
        return self.get_type_display() + ": " + str(self.range_from)+ " - " + str(self.range_to)

    def compute_range_to(self, value):
        self.range_to = self.range_from + int(value) - 1 # value is per bundle needs to minus 1
        self.save()


class VoidTicket(SoftDeletionModel):
    assigned_ticket = ForeignKey(AssignedTicket, on_delete=models.CASCADE)
    ticket_number = IntegerField()


class RemittanceForm(SoftDeletionModel):
    deployment = ForeignKey(Deployment, on_delete=models.CASCADE)
    fuel_cost = DecimalField(default=0, max_digits=19, decimal_places=10)
    fuel_receipt = CharField(max_length=36, null=True)
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
    start_ticket = IntegerField(default=0)
    end_ticket = IntegerField()
    total = DecimalField(default=0, null=True, max_digits=19, decimal_places=10)


class BeepShift(SoftDeletionModel):
    type = CharField(max_length=1, choices=SHIFT_TYPE)
    date = DateField(null=True)


class BeepTransaction(SoftDeletionModel):
    shift = ForeignKey(BeepShift, on_delete=models.CASCADE, null=True)
    card_number = CharField(null=True, max_length=20)
    total = DecimalField(default=0, max_digits=19, decimal_places=10)


class CarwashTransaction(SoftDeletionModel):
    date = DateField()
    member = ForeignKey(Member,on_delete=models.CASCADE)
    receipt = CharField(null=True, max_length=20)
    total = DecimalField(default=0, max_digits=19, decimal_places=10)
