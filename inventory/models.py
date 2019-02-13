import json

from django.db import models
# Create your models here.
from django.db.models import (BooleanField, CharField, DateField, DecimalField,
                              FileField, ForeignKey, IntegerField,
                              ManyToManyField, PositiveIntegerField, TextField)
from django.utils import timezone

from django.db.models.aggregates import Count
from random import randint

from core.models import SoftDeletionModel

MOVEMENT_TYPE = [
    ('G', 'Get'),
    ('R', 'Return'),
    ('B', 'Bought')
]

SHUTTLE_STATUS = [
    ('A', 'Available'),
    ('NM', 'Needs Maintenance'),
    ('UM', 'Under Maintenance'),
    ('B', 'Back-up')
]

REPAIR_STATUS = [
    ('NS', 'Not Started'),
    ('IP', 'In Progress'),
    ('C', 'Completed')
]
ROUTE = [
    ('M', 'Main Road'),
    ('R', 'Right Route'),  # Kanan
    ('L', 'Left Route'),  # Kaliwa
    ('B', 'Back-up')
]

DAYOFF_CHOICES = [
    ('1', 'Monday'),
    ('2', 'Tuesday'),
    ('3', 'Wednesday'),
    ('4', 'Thursday'),
    ('5', 'Friday'),
    ('6', 'Saturday'),
    ('7', 'Sunday')
]


class Shuttle(SoftDeletionModel):
    shuttle_number = PositiveIntegerField(unique=True)
    plate_number = CharField(max_length=6, unique=True)
    make = CharField(max_length=64)
    model = CharField(max_length=64)
    status = CharField(max_length=2, choices=SHUTTLE_STATUS)
    date_acquired = DateField()
    created = models.DateTimeField(editable=False, null=True)
    modified = models.DateTimeField(null=True)
    mileage = PositiveIntegerField()
    route = CharField(max_length=16)
    maintenance_sched = DateField(null=True)
    dayoff_date = CharField(max_length=16)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
            self.modified = timezone.now()
        self.modified = timezone.now()
        return super(Shuttle, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.id} - {self.make} - {self.model}"

    def random(self):
        count = self.aggregate(count=Count('id'))['count']
        random_index = randint(0, count - 1)
        return self.all()[random_index]


class Item(SoftDeletionModel):
    name = CharField(max_length=64)
    description = CharField(max_length=255)
    quantity = PositiveIntegerField()
    brand = CharField(max_length=64)
    consumable = BooleanField()
    average_price = DecimalField(max_digits=10, decimal_places=2)
    created = models.DateTimeField(editable=False, null=True)
    modified = models.DateTimeField(null=True)
    item_code = CharField(max_length=8)

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
    used_up = BooleanField()


class OutSourcedItems(SoftDeletionModel):
    item = CharField(max_length=64)
    quantity = PositiveIntegerField()
    unit_price = DecimalField(max_digits=10, decimal_places=2)


class Repair(SoftDeletionModel):
    shuttle = ForeignKey(Shuttle, on_delete=models.PROTECT)
    date_requested = DateField()
    vendor = CharField(max_length=64, null=True)
    start_date = DateField(null=True)
    end_date = DateField(null=True)
    status = CharField(max_length=2, choices=REPAIR_STATUS)
    labor_fee = DecimalField(max_digits=10, decimal_places=2, null=True)
    problems = ManyToManyField(RepairProblem)
    findings = ManyToManyField(RepairFinding)
    modifications = ManyToManyField(RepairModifications)
    outsourced_items = ManyToManyField(OutSourcedItems)
    maintenance = BooleanField(default=False)


class Vendor(SoftDeletionModel):
    name = CharField(max_length=64)
    address = CharField(max_length=126)
    contact_number = CharField(max_length=10)


class ItemMovement(SoftDeletionModel):
    item = ForeignKey(Item, on_delete=models.CASCADE)
    type = CharField(max_length=1, choices=MOVEMENT_TYPE)
    quantity = PositiveIntegerField()
    vendor = ForeignKey(Vendor, on_delete=models.PROTECT)
    unit_price = DecimalField(max_digits=10, decimal_places=2, null=True)
    repair = ForeignKey(Repair, on_delete=models.PROTECT, null=True)
    created = models.DateTimeField(editable=False, null=True)
    modified = models.DateTimeField(null=True)
    receipt = FileField(default='client/src/images/default.png', null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
            self.modified = timezone.now()
        self.modified = timezone.now()
        return super(ItemMovement, self).save(*args, **kwargs)


class PurchaseOrderItem(SoftDeletionModel):
    item = CharField(max_length=64)
    quantity = PositiveIntegerField()
    unit_price = DecimalField(max_digits=10, decimal_places=2)


class PurchaseOrder(SoftDeletionModel):
    po_number = CharField(max_length=6)
    vendor = ForeignKey(Vendor, on_delete=models.PROTECT)
    order_date = models.DateTimeField(editable=False)
    delivery_date = models.DateTimeField(null=True)
    po_items = ManyToManyField(PurchaseOrderItem)
    special_instruction = CharField(max_length=256)
    status = CharField(max_length=64)


