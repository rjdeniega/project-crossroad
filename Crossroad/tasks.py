from celery import Celery
from celery.schedules import crontab
from celery.task import periodic_task
import celery
from django.contrib.auth.models import User
from datetime import datetime
from celery.schedules import timedelta
from core.models import *
from members.models import *
from inventory.models import *
from remittances.models import *

app = Celery('Crossroad', broker='redis://localhost:6379/0')


@periodic_task(run_every=(crontab(minute=0, hour=0)), name="calculate_recommendations")
def update_here():
    shuttles = Shuttle.objects.all()
    for shuttle in shuttles: 

        if Repair.objects.filter(shuttle=shuttle.id).filter(
                maintenance=True).exists():
            repair_date = Repair.objects.filter(shuttle=pk).filter(
                maintenance=True).latest('end_date')
            days = repair_date - datetime.now().date()
            if days < 0:
                shuttle.status = "NM"
        else:
            shuttle = Shuttle.objects.get(id=pk)
            print(shuttle.maintenance_sched - datetime.now().date())
            days = shuttle.maintenance_sched - datetime.now().date()
            if days < 0:
                shuttle.status = "NM"