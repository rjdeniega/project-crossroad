from django.contrib import admin
from remittances.models import *
from import_export.admin import ImportExportModelAdmin
from django.contrib import admin

# Register your models here.
from remittances.resources import BeepTransactionResource

admin.site.register(Schedule)
admin.site.register(Shift)
admin.site.register(Deployment)
admin.site.register(VoidTicket)
admin.site.register(RemittanceForm)
admin.site.register(ShiftIteration)
admin.site.register(SubbedDeployments)
admin.site.register(ConsumedTicket)
admin.site.register(AssignedTicket)
admin.site.register(DriversAssigned)
admin.site.register(PresentDrivers)
admin.site.register(Redeployments)

@admin.register(BeepTransaction)
class BeepTransactionAdmin(ImportExportModelAdmin):
    resource_class = BeepTransactionResource
    pass
