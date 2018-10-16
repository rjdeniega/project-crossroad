from django.urls import path

from remittances.views import *

remittance_urls = [
    path('schedules/', ScheduleView.as_view()),
    path('schedules/create', CreateSchedule.as_view()),
    path('schedules/history', ScheduleHistoryView.as_view()),
    path('schedules/active', ActiveScheduleView.as_view()),
    path('schedules/get_date', GetDateSchedule.as_view()),
    path('schedules/<int:schedule_id>', SpecificScheduleView.as_view()),
    path('tickets/assign', AssignTicketView.as_view()),
    path('tickets/', AssignedTicketHistory.as_view()),
    path('deployments/', DeploymentView.as_view()),
    path('deployments/<int:pk>', DeploymentView.as_view()),
    path('deployments/deployed_drivers/<int:supervisor_id>', DeployedDrivers.as_view()),
    path('shifts/assigned_drivers/<int:supervisor_id>', PlannedDrivers.as_view()),
    path('shifts/sub_drivers/<int:supervisor_id>', SubDrivers.as_view()),
    path('shifts/pending_drivers/<int:supervisor_id>', NonDeployedDrivers.as_view()),
    path('remittance_form/driver/<int:driver_id>', DeploymentDetails.as_view()),
    path('remittance_form/', RemittanceFormView.as_view()),
    path('remittance_form/confirm', ConfirmRemittanceForm.as_view()),
    path('remittance_form/pending/<int:supervisor_id>', ConfirmRemittanceForm.as_view()),
    path('remittance_form/add_discrepancy/<int:remittance_form_id>', AddDiscrepancy.as_view()),
    path('get_carwash_transaction/<int:member_id>', CarwashTransactionView.as_view()),
    path('carwash_transaction/', CarwashTransactionView.as_view()),
    path('shift_iteration/', ShiftIterationView.as_view()),
    path('shift_iteration/finish/', FinishShiftIteration.as_view()),
    path('reports/shift_iterations/', ShiftIterationReport.as_view()),
    path('reports/shift_iterations/date', IterationsByDate.as_view()),
    path('reports/shift_iterations/schedule', IterationsBySchedule.as_view()),
    path('beep/', BeepTransactionView.as_view())
]
