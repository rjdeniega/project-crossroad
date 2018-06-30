from django.urls import path

from remittances.views import *


remittance_urls = [
    path('assigned_tickets/', AssignedTicketView.as_view()),
    path('assigned_tickets/<int:pk>', AssignedTicketView.as_view()),
    path('void_tickets/', VoidTicketView.as_view()),
    path('void_tickets/<int:pk>', VoidTicketView.as_view())
]