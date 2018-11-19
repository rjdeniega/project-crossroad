from django.db import models
from django.db.models import Model, QuerySet, Manager, CharField, DateTimeField, BooleanField
from django.utils import timezone


# Create your models here.
# These models are for audit trail
# When an object is deleted, it doesnt get removed it just gets archived
# refer to


class SoftDeletionQuerySet(QuerySet):
    def delete(self):
        return super(SoftDeletionQuerySet, self).update(archived_at=timezone.now())

    def undelete(self):
        return super(SoftDeletionQuerySet, self).update(archived_at=None, user=None)

    def hard_delete(self):
        return super(SoftDeletionQuerySet, self).delete()

    def alive(self):
        return self.filter(archived_at=None)

    def dead(self):
        return self.exclude(archived_at=None)


class SoftDeletionManager(Manager):
    def __init__(self, *args, **kwargs):
        self.alive_only = kwargs.pop('alive_only', False)
        self.archived_only = kwargs.pop('archived_only', False)

        super(SoftDeletionManager, self).__init__(*args, **kwargs)

    def get_queryset(self):

        if self.alive_only:
            return SoftDeletionQuerySet(self.model).filter(archived_at=None)

        if self.archived_only:
            return SoftDeletionQuerySet(self.model).exclude(archived_at=None)

        return SoftDeletionQuerySet(self.model)

    def hard_delete(self):
        return self.get_queryset().hard_delete()


class SoftDeletionModel(Model):
    archived_at = DateTimeField(blank=True, null=True)
    objects = SoftDeletionManager()
    current = SoftDeletionManager(alive_only=True)
    archived = SoftDeletionManager(archived_only=True)
    archiver = CharField(max_length=32, blank=True)

    class Meta:
        abstract = True

    def delete(self, **kwargs):
        self.archived_at = timezone.now()
        self.archiver = kwargs['users']
        self.save()

    def hard_delete(self):
        super(SoftDeletionModel, self).delete()

    def undelete(self):
        self.archived_at = None
        self.archiver = ""
        self.save()


NOTIFICATION_TYPE = [
    ('I', 'Inventory'), # Mechanic, Clerk, OM
    ('R', 'Remittances'), # OM, Supervisor, Clerk
    ('M', 'Members'), # Members, Clerk
    ('N', 'Maintenance')
]


class Notification(SoftDeletionModel):
    type = CharField(max_length=1, choices=NOTIFICATION_TYPE)
    description = CharField(max_length=255)
    is_read = BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
            self.modified = timezone.now()
        self.modified = timezone.now()
        return super(Notification, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.description}"
