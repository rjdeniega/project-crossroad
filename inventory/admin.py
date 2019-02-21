from django.contrib import admin

# Register your models here.
from inventory.models import *

admin.site.register(Shuttle)
admin.site.register(Item)
admin.site.register(UsedItem)
admin.site.register(RepairProblem)
admin.site.register(RepairModifications)
admin.site.register(Repair)
admin.site.register(ItemMovement)
admin.site.register(OutSourcedItems)
admin.site.register(PurchaseOrderItem)
admin.site.register(PurchaseOrder)
admin.site.register(Vendor)
