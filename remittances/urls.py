from django.urls import path

from remittances.views import *


remittance_urls = [
    path('schedules/', ScheduleView.as_view()),
    path('deployments/', DeploymentView.as_view()),
    path('deployments/<int:pk>', DeploymentView.as_view()),
    path('shifts/', ShiftView.as_view()),
    path('remittance_form/', RemittanceFormView.as_view())
]