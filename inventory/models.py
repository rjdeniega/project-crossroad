from django.db import models

# Create your models here.
from django.db.models import ForeignKey
from django.db.models import CharField, PositiveIntegerField, DateField, IntegerField, TextField, DecimalField
from django.db.models import ManyToManyField

from core.models import SoftDeletionModel


class Shuttle(SoftDeletionModel):
    plate_number = CharField(max_length=6, unique=True)
    make = CharField(max_length=64)
    model = CharField(max_length=64)
    date_acquired = DateField()

    def __str__(self):
        return f"{self.id} - {self.make} - {self.model}"

# TODO Complete these fields


class Item(SoftDeletionModel):
    name = CharField(max_length=64)
    quantity = PositiveIntegerField()

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
    date = DateField()
    labor_fee = DecimalField(max_digits=10, decimal_places=2)
    problems = ManyToManyField(RepairProblem)
    findings = ManyToManyField(RepairFinding)
    modifications = ManyToManyField(RepairModifications)

# TODO @Paolo I dont know the fields for this
# class ItemMovement(SoftDeletionModel):

# TODO - fill these up

# class PreventiveMaintenance(SoftDeletionModel):
# class ItemMovement(SoftDeletionModel):

