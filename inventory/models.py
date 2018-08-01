from django.db import models
from django.utils import timezone

# Create your models here.
from django.db.models import ForeignKey
from django.db.models import CharField, PositiveIntegerField, DateField, IntegerField, TextField, DecimalField
from django.db.models import ManyToManyField

from core.models import SoftDeletionModel
import json

MOVEMENT_TYPE = [
    ('G', 'Get'),
    ('R', 'Return'),
    ('B', 'Bought')
]

SHUTTLE_STATUS = [
    ('A', 'Available'),
    ('NM', 'Needs Maintenance'),
    ('UM', 'Under Maintenance')
]

REPAIR_STATUS = [
    ('NS', 'Not Started'),
    ('IP', 'In Progress'),
    ('C', 'Completed')
]


class Shuttle(SoftDeletionModel):

    plate_number = CharField(max_length=6, unique=True)
    make = CharField(max_length=64)
    model = CharField(max_length=64)
    status = CharField(max_length=2, choices=SHUTTLE_STATUS)
    date_acquired = DateField()
    created = models.DateTimeField(editable=False, null=True)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
            self.modified = timezone.now()
        self.modified = timezone.now()
        return super(Shuttle, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.id} - {self.make} - {self.model}"


class Item(SoftDeletionModel):
    name = CharField(max_length=64)
    description = CharField(max_length=255)
    quantity = PositiveIntegerField()
    brand = CharField(max_length=64)
    created = models.DateTimeField(editable=False, null=True)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
            self.modified = timezone.now()
        self.modified = timezone.now()
        return super(Item, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}"


class UsedItem(SoftDeletionModel):
    item = ForeignKey(Item, on_delete=models.CASCADE)
    quantity = IntegerField()


class RepairProblem(SoftDeletionModel):
    description = TextField(max_length=255)


class RepairFinding(SoftDeletionModel):
    description = TextField()


class RepairModifications(SoftDeletionModel):
    item_used = ForeignKey(Item, on_delete=models.CASCADE)
    quantity = PositiveIntegerField()
    description = TextField()


class Repair(SoftDeletionModel):
    shuttle = ForeignKey(Shuttle, on_delete=models.PROTECT)
    date_requested = DateField()
    start_date = DateField(null=True)
    end_date = DateField(null=True)
    status = CharField(max_length=2, choices=REPAIR_STATUS)
    labor_fee = DecimalField(max_digits=10, decimal_places=2, null=True)
    problems = ManyToManyField(RepairProblem)
    findings = ManyToManyField(RepairFinding)
    modifications = ManyToManyField(RepairModifications)


class ItemMovement(SoftDeletionModel):
    item = ForeignKey(Item, on_delete=models.CASCADE)
    type = CharField(max_length=1, choices=MOVEMENT_TYPE)
    quantity = PositiveIntegerField()
    vendor = CharField(max_length=64)
    unit_price = DecimalField(max_digits=10, decimal_places=2)
    repair = ForeignKey(Repair, on_delete=models.PROTECT, null=True)
    created = models.DateTimeField(editable=False, null=True)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
            self.modified = timezone.now()
        self.modified = timezone.now()
        return super(ItemMovement, self).save(*args, **kwargs)
