from django.urls import path

from remittances.views import *


remittance_urls = [
    path('assigned_tickets/', AssignedTicketView.as_view())
]