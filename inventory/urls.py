from django.urls import path

from inventory.views import *

inventory_urls = [
    # Inventory URLS
    path('items/', ItemView.as_view()),
    path('items/<int:pk>', ItemView.as_view()),
    path('items/restock/<int:pk>', QuantityRestock.as_view()),

    # Shuttles & Maintenance URLS
    path('shuttles/', ShuttlesView.as_view()),
    path('shuttles/<int:pk>', ShuttlesView.as_view()),
    path('shuttles/repairs/<int:pk>', RepairProblems.as_view())
]
