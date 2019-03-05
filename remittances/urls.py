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
    path('tickets_per_supervisor/<int:supervisor_id>', AssignedTicketHistoryPerSupervisor.as_view()),
    path('tickets/<int:deployment_id>', DeploymentTickets.as_view()),

    path('deployments/', DeploymentView.as_view()),
    path('deployments/<int:pk>', DeploymentView.as_view()),
    path('specific_deployments/<int:shift_id>', SpecificDeploymentView.as_view()),
    path('deployments/back-up-shuttles/', BackUpShuttles.as_view()),
    path('deployments/back-up-shuttles/deploy/', BackUpShuttles.as_view()),
    path('deployments/deployed_drivers/<int:supervisor_id>', DeployedDrivers.as_view()),
    path('deployments/<int:supervisor_id>/<int:driver_id>', SpecificDriver.as_view()),
    path('deployments/pre-details/<int:driver_id>', PreDeploymentDetails.as_view()),
    path('deployments/deploy-sub/', DeploySubDriver.as_view()),
    path('deployments/<int:deployment_id>/available-shuttles', ShuttleBreakdown.as_view()),
    path('deployments/shuttle-breakdown/redeploy/', ShuttleBreakdown.as_view()),
    path('deployments/<int:deployment_id>/available-drivers', RedeployDriver.as_view()),
    path('deployments/early-leave/redeploy/', RedeployDriver.as_view()),
    path('deployments/driver/<int:driver_id>', DriverDeployment.as_view()),

    path('shifts/', ShiftView.as_view()),
    path('shifts/all', GeneralShiftView.as_view()),
    path('shifts/remarks', ShiftRemarks.as_view()),
    path('shifts/remarks/<int:supervisor_id>', ShiftRemarks.as_view()),
    path('shifts/assigned_drivers/<int:supervisor_id>', PlannedDrivers.as_view()),
    path('shifts/sub_drivers/<int:supervisor_id>', SubDrivers.as_view()),
    path('shifts/pending_drivers/<int:supervisor_id>', NonDeployedDrivers.as_view()),

    path('remittance_form/submit/', SubmitRemittance.as_view()),
    path('remittance_form/view/<int:deployment_id>', ViewRemittance.as_view()),
    path('remittance_form/pending/<int:supervisor_id>', PendingRemittances.as_view()),
    path('remittance_form/<int:remittance_id>/confirm/', PendingRemittances.as_view()),
    path('supervisor_remittances/<int:supervisor_id>', ViewRemittancePerSupervisor.as_view()),

    path('remittance_form/driver/<int:driver_id>', DeploymentDetails.as_view()),
    path('remittance_form/', RemittanceFormView.as_view()),
    path('remittance_form/confirm', ConfirmRemittanceForm.as_view()),
    path('remittance_form/add_discrepancy/<int:remittance_form_id>', AddDiscrepancy.as_view()),

    path('get_carwash_transaction/<int:member_id>', CarwashTransactionView.as_view()),
    path('carwash_transaction/', CarwashTransactionView.as_view()),

    path('shift_iteration/', ShiftIterationView.as_view()),
    path('shift_iteration/finish/', FinishShiftIteration.as_view()),
    
    path('reports/shift_iterations/', ShiftIterationReport.as_view()),
    path('reports/shift_iterations/date', IterationsByDate.as_view()),
    path('reports/shift_iterations/schedule', IterationsBySchedule.as_view()),
    path('beep/', BeepTransactionView.as_view()),
    path('beep_modified/', BeepCollapsedView.as_view())
]
