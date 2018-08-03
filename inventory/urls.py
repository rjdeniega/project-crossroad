from django.urls import path

from inventory.views import *

inventory_urls = [
    # Inventory URLS
    path('items/', ItemView.as_view()),
    path('items/<int:pk>', ItemView.as_view()),
    path('items/specific/<int:pk>', SpecificItemView.as_view()),
    path('items/restock/<int:pk>', QuantityRestock.as_view()),

    # Shuttles & Maintenance URLS
    path('shuttles/', ShuttlesView.as_view()),
    path('shuttles/<int:pk>', ShuttlesView.as_view()),
    path('shuttles/repairs/<int:pk>', RepairProblems.as_view()),
    path('shuttles/repairs/specific/<int:pk>', ProblemsView.as_view()),
    path('mechanic/repairs', MechanicRepairs.as_view()),
    path('mechanic/repairs/<int:pk>', MechanicRepairs.as_view()),
    path('mechanic/items/<int:consume>', MechanicItems.as_view()),
    path('mechanic/items/add/<int:pk>', MechanicItems.as_view()),
    path('finalize/<int:pk>', OutsourceModification.as_view()),

    # Maintenance Report
    path('report/<int:pk>', MaintenanceReport.as_view())
]
