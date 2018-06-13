from django.urls import path

from inventory.views import ItemView

inventory_urls = [
    path('items/', ItemView.as_view()),
    path('items/<int:pk>', ItemView.as_view())
]
