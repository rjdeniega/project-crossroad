from django.contrib import admin
from remittances.models import *
from import_export.admin import ImportExportModelAdmin
from django.contrib import admin

# Register your models here.

admin.site.register(Shift)
admin.site.register(Deployment)
admin.site.register(VoidTicket)
admin.site.register(RemittanceForm)


@admin.register(BeepTransaction)
class BeepTransactionAdmin(ImportExportModelAdmin):
    pass
