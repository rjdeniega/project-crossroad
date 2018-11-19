from celery import Celery
from celery.schedules import crontab
from celery.task import periodic_task
import celery
from django.contrib.auth.models import User
from datetime import datetime
from celery.schedules import timedelta

app = Celery('Crossroad', broker='redis://localhost:6379/0')


@periodic_task(run_every=(crontab(minute=0, hour=0)), name="calculate_recommendations")
def update_here():
    pass