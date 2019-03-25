import json

from django.db import models
# Create your models here.
from django.db.models import (BooleanField, CharField, DateField, DecimalField,
                              ForeignKey, IntegerField, ManyToManyField, PositiveIntegerField, TextField)
from django.utils import timezone

from django.db.models.aggregates import Count
from random import randint

from core.models import SoftDeletionModel
from members.models import Driver

MOVEMENT_TYPE = [
    ('G', 'Get'),
    ('R', 'Return'),
    ('B', 'Bought')
]

SHUTTLE_STATUS = [
    ('A', 'Available'),
    ('NM', 'Needs Maintenance'),
    ('UM', 'Under Maintenance'),
    ('B', 'Back-up'),
    ('FI', 'For Investigation'),
]

REPAIR_STATUS = [
    ('NS', 'Not Started'),  # Operations Manager (Determine what kind of repair)
    ('FI', 'For Investigation'),  # Mechanic (Add findings)
    ('IP', 'In Progress'),  # Mechanic (Start repairs)
    ('C', 'Completed'),  # Operations manager
    ('FO', 'For Outsource'),  # Mechanic (Add outsourced costs )
    ('SR', 'Scheduled Repair'),
    ('RO', 'Returned to Operations Manager')  # When mechanic can't finish a repair and it must be outsourced
]
REPAIR_DEGREE = [
    ('MIN', 'Minor'),  # Operations Manager (Determine what kind of repair)
    ('INT', 'Intermediate'),  # Mechanic (Add findings)
    ('MAJ', 'Major'),  # Mechanic (Start repairs)

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


class Vendor(SoftDeletionModel):
    name = CharField(max_length=64)
    address = CharField(max_length=126)
    contact_number = CharField(max_length=10)

    def __str__(self):
        return self.name


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
    dayoff_date = CharField(max_length=16, null=True)
    purchase_price = DecimalField(max_digits=10, decimal_places=2)
    salvage_value = DecimalField(max_digits=10, decimal_places=2)
    lifespan = PositiveIntegerField()

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


class ItemCategory(SoftDeletionModel):
    category = CharField(max_length=64, unique=True)
    code_prefix = CharField(max_length=3)
    quantity = PositiveIntegerField()
    minimum_quantity = PositiveIntegerField()


class VendorItem(SoftDeletionModel):
    vendor = ForeignKey(Vendor, on_delete=models.CASCADE)
    category = ForeignKey(ItemCategory, on_delete=models.CASCADE)


class PurchaseOrderItem(SoftDeletionModel):
    quantity = PositiveIntegerField()
    description = CharField(max_length=64)
    unit_price = DecimalField(max_digits=10, decimal_places=2)
    category = ForeignKey(ItemCategory, on_delete=models.CASCADE)
    item_type = CharField(max_length=255)
    measurement = PositiveIntegerField(null=True)
    unit = CharField(max_length=10, null=True)
    brand = CharField(max_length=64)
    delivery_date = models.DateTimeField(null=True)
    received = BooleanField(default=False)
    returned = BooleanField(default=False)
    remarks = CharField(max_length=255, null=True)


class PurchaseOrder(SoftDeletionModel):
    po_number = CharField(max_length=6)
    vendor = ForeignKey(Vendor, on_delete=models.CASCADE)
    order_date = models.DateTimeField(editable=False)
    expected_delivery = models.DateTimeField()
    completion_date = models.DateTimeField(null=True)
    po_items = ManyToManyField(PurchaseOrderItem)
    special_instruction = CharField(max_length=256)
    status = CharField(max_length=64)
    receipt = models.ImageField(null=True, upload_to='media')


class VendorPerformance(SoftDeletionModel):
    vendor = ForeignKey(Vendor, on_delete=models.CASCADE)
    defective_category = ForeignKey(ItemCategory, on_delete=models.CASCADE, null=True)
    purchase_order = ForeignKey(PurchaseOrder, on_delete=models.CASCADE, null=True)
    expected_delivery = models.DateTimeField(null=True)
    actual_delivery = models.DateTimeField(null=True)


class Item(SoftDeletionModel):
    description = CharField(max_length=255)
    quantity = PositiveIntegerField()
    category = ForeignKey(ItemCategory, on_delete=models.CASCADE)
    unit_price = DecimalField(max_digits=10, decimal_places=2)
    item_type = CharField(max_length=255)
    measurement = PositiveIntegerField(null=True)
    unit = CharField(max_length=10, null=True)
    brand = CharField(max_length=64)
    vendor = ForeignKey(Vendor, on_delete=models.CASCADE)
    created = models.DateTimeField(editable=False, null=True)
    modified = models.DateTimeField(null=True)
    item_code = CharField(max_length=6)
    delivery_date = models.DateTimeField(null=True)
    current_measurement = PositiveIntegerField(null=True)
    purchase_order = ForeignKey(PurchaseOrder, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
            self.modified = timezone.now()
        self.modified = timezone.now()
        return super(Item, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.brand}"


class UsedItem(SoftDeletionModel):
    item = ForeignKey(Item, on_delete=models.CASCADE)
    quantity = IntegerField()


class RepairProblem(SoftDeletionModel):
    description = TextField(max_length=255)


class RepairFinding(SoftDeletionModel):
    description = TextField()
    item_defect = ForeignKey(ItemCategory, null=True, on_delete=models.CASCADE)


class RepairModifications(SoftDeletionModel):
    item_used = ForeignKey(Item, on_delete=models.CASCADE)
    quantity = PositiveIntegerField(null=True)
    amount = PositiveIntegerField(null=True)


class OutSourcedItems(SoftDeletionModel):
    item = CharField(max_length=64)
    quantity = PositiveIntegerField()
    unit_price = DecimalField(max_digits=10, decimal_places=2)


class Repair(SoftDeletionModel):
    shuttle = ForeignKey(Shuttle, on_delete=models.PROTECT)
    driver_requested = ForeignKey(Driver, on_delete=models.CASCADE)
    date_requested = DateField()
    vendor = CharField(max_length=64, null=True)
    start_date = DateField(null=True)
    end_date = DateField(null=True)
    recommendation = CharField(max_length=64, null=True)
    degree = CharField(max_length=64, null=True)
    schedule = DateField(null=True)
    status = CharField(max_length=2, choices=REPAIR_STATUS)
    labor_fee = DecimalField(max_digits=10, decimal_places=2, null=True)
    remarks = CharField(max_length=256, null=True)
    problems = ManyToManyField(RepairProblem)
    findings = ManyToManyField(RepairFinding)
    modifications = ManyToManyField(RepairModifications)
    outsourced_items = ManyToManyField(OutSourcedItems)
    maintenance = BooleanField(default=False)


class ItemRequest(SoftDeletionModel):
    category = ForeignKey(ItemCategory, on_delete=models.CASCADE)
    description = CharField(max_length=64, null=True)


class ItemMovement(SoftDeletionModel):
    item = ForeignKey(Item, on_delete=models.CASCADE)
    type = CharField(max_length=1, choices=MOVEMENT_TYPE)
    quantity = PositiveIntegerField()
    remarks = CharField(max_length=64, null=True)
    unit_price = DecimalField(max_digits=10, decimal_places=2, null=True)
    repair = ForeignKey(Repair, on_delete=models.CASCADE, null=True)
    created = models.DateTimeField(editable=False, null=True)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
            self.modified = timezone.now()
        self.modified = timezone.now()
        return super(ItemMovement, self).save(*args, **kwargs)
