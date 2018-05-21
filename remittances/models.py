from django.db import models
from django.db.models import *
from core.models import SoftDeletionModel
from members.models import *

# Create your models here.


class AssignedTicket(SoftDeletionModel):
    driver = ForeignKey(Driver,on_delete=models.CASCADE)
    range_from = CharField(max_length=64)
    range_to = CharField(max_length=64)
    type = CharField(max_length=64)   # TODO - change this


class VoidTicket(SoftDeletionModel):
    ticket_number = CharField(max_length=64)
    assigned_ticket = ForeignKey(AssignedTicket,on_delete=models.CASCADE)
