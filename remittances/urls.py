from django.urls import path

from remittances.views import *


remittance_urls = [
    path('schedules/', ScheduleView.as_view()),
    path('deployments/', DeploymentView.as_view()),
    path('deployments/<int:pk>', DeploymentView.as_view()),
    path('deployments/deployed_drivers', DeployedDrivers.as_view()),
    path('shifts/', ShiftView.as_view()),
    path('shifts/assigned_drivers/<int:supervisor_id>', PlannedDrivers.as_view()),
    path('remittance_form/', RemittanceFormView.as_view()),
    path('remittance_form/confirm', ConfirmRemittanceForm.as_view()),
    path('shift_iteration/', ShiftIterationView.as_view())
]