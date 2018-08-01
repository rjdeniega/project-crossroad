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
    path('shares_by_date/', SharesByDate.as_view())

]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
