from import_export.resources import ModelResource
from .models import BeepTransaction


class BeepTransactionResource(ModelResource):
    class Meta:
        model = BeepTransaction
        fields = ('total', 'card_number', 'id', 'shift')
        exclude = ('archiver', 'archived_at')
