from django.urls import path

from members.views import *

members_urls = [
    path('drivers/', DriverView.as_view()),
    path('members/', MemberView.as_view())
]