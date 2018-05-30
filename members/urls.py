from django.urls import path

from members.views import DriverView

members_urls = [
    path('drivers/', DriverView.as_view()),
]