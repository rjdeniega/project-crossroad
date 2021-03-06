from rest_framework.serializers import ModelSerializer
from .models import *


class ItemSerializer(ModelSerializer):
    class Meta:
        model = Item
        fields = "__all__"


class MovementSerializer(ModelSerializer):
    class Meta:
        model = ItemMovement
        fields = "__all__"


class ShuttlesSerializer(ModelSerializer):
    class Meta:
        model = Shuttle
        fields = "__all__"


class RepairSerializer(ModelSerializer):
    class Meta:
        model = Repair
        fields = "__all__"


class RepairProblemSerializer(ModelSerializer):
    class Meta:
        model = RepairProblem
        fields = "__all__"


class RepairFindingSerializer(ModelSerializer):
    class Meta:
        model = RepairFinding
        fields = "__all__"


class RepairModificationsSerializer(ModelSerializer):
    class Meta:
        model = RepairModifications
        fields = "__all__"


class OutsourcedItemsSerializer(ModelSerializer):
    class Meta:
        model = OutSourcedItems
        fields = "__all__"


class PurchaseOrderSerializer(ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = "__all__"


class PurchaseOrderItemSerializer(ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = "__all__"


class VendorSerializer(ModelSerializer):
    class Meta:
        model = Vendor
        fields = "__all__"


class ItemCategorySerializer(ModelSerializer):
    class Meta:
        model = ItemCategory
        fields = "__all__"


class ItemRequestSerializer(ModelSerializer):
    class Meta:
        model = ItemRequest
        fields = "__all__"


class VendorPerformanceSerializer(ModelSerializer):
    class Meta:
        model = VendorPerformance
        fields = "__all__"
