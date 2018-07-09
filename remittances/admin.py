from django.contrib import admin
from remittances.models import *

# Register your models here.

admin.site.register(Shift)
admin.site.register(Deployment)
admin.site.register(VoidTicket)
admin.site.register(RemittanceForm)
