from django.urls import path

from members.views import *

members_urls = [
    path('drivers/', DriverView.as_view()),
    path('supervisors/', SupervisorView.as_view()),
    path('operations-managers/', OperationsManagerView.as_view()),
    path('clerks/', ClerkView.as_view()),
    path('', MemberView.as_view()),
    path('<int:pk>', MemberView.as_view()),
    path('members/<int:member_key>', MemberView.as_view()),
    path('prospects/', ProspectView.as_view()),
    path('prospects/<int:pk>', ProspectView.as_view())
]