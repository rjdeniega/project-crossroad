from django.urls import path

from members.views import *

members_urls = [
    path('drivers/', DriverView.as_view()),
    path('supervisors/', SupervisorView.as_view()),
    path('operations-managers/', OperationsManagerView.as_view()),
    path('clerks/', ClerkView.as_view()),
    path('', MemberView.as_view()),
    path('<int:pk>', MemberView.as_view()),
    path('transactions/<int:member_id>', MemberTransactionView.as_view()),
    path('shares/<int:member_id>', MemberSharesView.as_view()),
    path('prospects/', ProspectView.as_view()),
    path('cards/<int:member_id>', IDCardView.as_view()),
    path('profile/<int:member_id>', SpecificMemberView.as_view()),
    path('prospects/<int:pk>', ProspectView.as_view())
]
