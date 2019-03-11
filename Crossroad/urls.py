"""Crossroad URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include
from django.urls import path

from core.views import SignInView
from core.views import *
from members.urls import *
from inventory.urls import *
from remittances.urls import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('sign-in', SignInView.as_view()),
    path('raw-user', CreateDefaultUserView.as_view()),
    path('users', CreateUserView.as_view()),
    path('staff_accounts', PersonView.as_view()),
    path('users/is_unique', UserHandler().as_view()),
    path('users/all', UserView.as_view()),
    path('admin/', admin.site.urls),
    path('members/', include(members_urls)),
    path('inventory/', include(inventory_urls)),
    path('remittances/', include(remittance_urls)),
    path('remittance_report/', RemittanceReport.as_view()),
    path('shares_report/', SharesReport.as_view()),
    path('transaction_report/', TransactionReport.as_view()),
    path('transaction_report_by_date/', TransactionByDate.as_view()),
    path('shares_by_date/', SharesByDate.as_view()),
    path('passengers_by_date/', PassengerCountByDate.as_view()),
    path('passengers/', PassengerCount.as_view()),
    path('notifications/<str:user_type>/<int:user_id>', NotificationItems.as_view()),
    path('notifications/mark/<int:pk>', ChangeNotificationStatus.as_view()),
    path('remittance_versus_fuel/', RemittanceVersusFuelReport.as_view()),
    path('tickets_count_report/', TicketCountReport.as_view()),
    path('tickets_count_report_range/', TicketTypeWithRange.as_view()),
    path('ticket_type_per_day/', TicketTypePerDayReport.as_view()),
    path('ticket_type_per_shuttle/', TicketTypePerShuttle.as_view()),
    path('supervisor_weekly_report/', SupervisorWeeklyReport.as_view()),
    path('accumulated_shares_report/', AccumulatedSharesReport.as_view()),
    path('shuttle_net_income_report/', ShuttleCostVRevenueReport.as_view()),
    path('remittance_per_route_report/', RemittancePerRouteReport.as_view()),
    path('member_transaction_report/', MemberTransactionByReport.as_view()),
    path('beep_tickets/', BeepTickets.as_view()),
    path('patronage_refund/', PatronageRefund.as_view()),
    path('remittance_for_the_month/', RemittanceForTheMonth.as_view()),
    path('passenger_per_route/', PassengerPerRoute.as_view()),
    path('peak_hours/', PeakHourReport.as_view()),
    path('beep_tickets_per_route/', BeepTicketsPerRoute.as_view()),
    path('driver_performance/', DriverPerformance.as_view()),
    path('remittance_per_year/', RemittancePerYear.as_view())
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
