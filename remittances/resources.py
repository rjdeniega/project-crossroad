from import_export.resources import ModelResource
from .models import BeepTransaction


class BeepTransactionResource(ModelResource):
    class Meta:
        model = BeepTransaction
        fields = ('total', 'card_number', 'id', 'shuttle', 'shift', 'transaction_date_time', 'card_profile_name')
        exclude = ('archiver', 'archived_at')

    def get_or_init_instance(self, instance_loader, row):
        """
        Either fetches an already existing instance or initializes a new one.
        """
        print(row['card_number'])
        instance = self.get_instance(instance_loader, row)
        if instance:
            instance.total += row.total
            instance.save()
            print(instance)
            return instance, False
        else:
            return self.init_instance(row), True


