from django.urls import path

from inventory.views import *

inventory_urls = [
    # Inventory URLS
    path('items/', ItemView.as_view()),
    path('items/with_quantity/', ItemsWithQuantity.as_view()),
    path('items_and_movement/', ItemAndMovement.as_view()),
    path('items/<int:pk>', ItemView.as_view()),
    path('items/specific/<int:pk>', SpecificItemView.as_view()),
    path('items/restock/<int:pk>', QuantityRestock.as_view()),
    path('items/item_movement_report', ItemMovementReport.as_view()),
    path('items/item_category/', ItemCategoryView.as_view()),

    # Purchase Order URLS
    path('vendors/', VendorsView.as_view()),
    path('vendors/<int:pk>', VendorSpecific.as_view()),
    path('purchase_order/', PurchaseOrderView.as_view()),
    path('purchase_order/<int:pk>', PurchaseOrderSpecific.as_view()),
    path('purchase_order/update/<int:pk>', UpdatePurchaseOrder.as_view()),
    path('purchase_order/<int:pk>/items', GetPurchaseOrderItems.as_view()),
    path('purchase_order/confirm_item/<int:po>/<int:pk>', PurchaseOrderItemView.as_view()),

    # Shuttles & Maintenance URLS
    path('shuttles/', ShuttlesView.as_view()),
    path('shuttles/<int:pk>', ShuttlesView.as_view()),
    path('shuttles/repairs/<int:pk>', RepairProblems.as_view()),
    path('shuttles/repairs/specific/<int:pk>', ProblemsView.as_view()),
    path('shuttles/setmaintenance/<int:pk>', MaintenanceSchedule.as_view()),
    path('shuttles/latestmaintenance/<int:pk>', MaintenanceSchedule.as_view()),
    path('shuttles/startmaintenance/<int:pk>', StartMaintenance.as_view()),
    path('shuttles/maintenance_report/', ShuttleMaintenanceFrequency.as_view()),
    path('mechanic/repairs', MechanicRepairs.as_view()),
    path('mechanic/repairs/<int:pk>', MechanicRepairs.as_view()),
    path('mechanic/items/<int:consume>', MechanicItems.as_view()),
    path('mechanic/items/add/<int:pk>', MechanicItems.as_view()),
    path('finalize/<int:pk>', OutsourceModification.as_view()),
    path('shuttles/dayoffs', ShuttleDayOff.as_view()),
    path('mechanic/findings/<int:pk>', AddFindingFromMechanic.as_view()),

    # Maintenance Report
    path('report/<int:pk>', MaintenanceReport.as_view()),
    path('request_item/', RequestItem.as_view()),
    path('repair_request/driver/<int:pk>', DriverRepairRequest.as_view()),
    path('repair/update_status/<int:pk>', UpdateRepairStatus.as_view()),
    path('item_movement_report/', FinalItemMovementReport.as_view()),
]
