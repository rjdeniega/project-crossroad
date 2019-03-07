from django.db import models
from django.db.models import *
from django.utils import timezone
from datetime import datetime
from members.models import *
from inventory.models import *

# Create your models here.
TICKET_TYPE = [
    ('A', '10 Pesos'),
    ('B', '12 Pesos'),
    ('C', '15 Pesos')
]
ROUTE = [
    ('M', 'Main Road'),
    ('R', 'Right Route'),  # Kanan
    ('L', 'Left Route')  # Kaliwa
]

SHIFT_TYPE = [
    ('A', 'AM'),
    ('P', 'PM'),
]

DRIVER_DEPLOYMENT_TYPE = [
    'Early',
    'Regular',
    'Late'
]

DEPLOYMENT_STATUS = [
    ('O', 'Ongoing'),
    ('F', 'Finished')
]

FORM_STATUS = [
    ('P', 'Pending'),
    ('C', 'Completed')
]

ITERATION_STATUS = [
    ('O', 'Ongoing'),
    ('F', 'Finished')
]

DEPLOYMENT_RESULTS = [
    ('S', 'Successful'),
    ('E', 'Early-end'),
    ('B', 'Breakdown')
]


class Schedule(models.Model):
    start_date = DateField()
    end_date = DateField(null=True)
    created = models.DateTimeField(editable=False)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Schedule, self).save(*args, **kwargs)

    def create(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Schedule, self).save(*args, **kwargs)

    def get_status(self, current_schedule):
        if current_schedule is None:
            if self.start_date > datetime.today().date():
                return 'pending'
            elif self.end_date < datetime.today().date():
                return 'completed'

        if self.id == current_schedule.id:
            return 'current'
        elif self.start_date < current_schedule.start_date:
            return 'completed'
        else:
            return 'pending'


class Shift(models.Model):
    type = CharField(max_length=1, choices=SHIFT_TYPE)
    supervisor = ForeignKey(Driver, on_delete=models.CASCADE)
    schedule = ForeignKey(Schedule, on_delete=models.CASCADE)
    created = models.DateTimeField(editable=False)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Shift, self).save(*args, **kwargs)

    def get_type_display(self):
        if self.type is 'A':
            return 'AM'
        return 'PM'

    def __str__(self):
        shift_name = self.get_type_display() + " shift"
        schedule = self.schedule.start_date.strftime('%m/%d/%Y') + " to " + self.schedule.end_date.strftime('%m/%d/%Y')
        supervisor = self.supervisor.name
        return (shift_name + " - " + schedule + " - " + supervisor)


class DriversAssigned(models.Model):
    driver = ForeignKey(Driver, related_name='driver_name', on_delete=models.CASCADE)
    shuttle = ForeignKey(Shuttle, on_delete=models.CASCADE)
    deployment_type = CharField(max_length=16)
    shift = ForeignKey(Shift, on_delete=models.CASCADE)

    def __str__(self):
        return self.driver.name + ' driving '


class ShiftIteration(models.Model):
    shift = ForeignKey(Shift, on_delete=models.CASCADE)
    date = DateField(default=timezone.now)
    status = CharField(max_length=1, choices=ITERATION_STATUS, default='O')
    remarks = CharField(max_length=64, null=True)

    def __str__(self):
        shift_type = self.shift.get_type_display()
        date = self.date.strftime('%m/%d/%Y')
        status = self.get_status_display()
        return (shift_type + ' Shift on ' + date + ' (' + status + ')')

    def get_status_display(self):
        if self.status == 'O':
            return 'Ongoing'
        return 'Finished'

    def finish_shift(self):
        self.status = 'F'
        self.save()


class Deployment(models.Model):
    driver = ForeignKey(Driver, on_delete=models.CASCADE)
    shuttle = ForeignKey(Shuttle, on_delete=models.CASCADE)
    route = CharField(max_length=1, choices=ROUTE)
    shift_iteration = ForeignKey(ShiftIteration, on_delete=models.CASCADE)
    status = CharField(max_length=1, choices=DEPLOYMENT_STATUS, default='O')
    start_time = DateTimeField(default=timezone.now, editable=False)
    end_time = DateTimeField(null=True)
    result = CharField(max_length=1, choices=DEPLOYMENT_RESULTS, null=True)
    reason = CharField(max_length=64, blank=True)
    created = models.DateTimeField(editable=False, default=timezone.now)
    modified = models.DateTimeField(null=True)

    def __str__(self):
        driver_name = self.driver.name
        shuttle = str(self.shuttle.shuttle_number) + " - " + self.shuttle.plate_number
        route = self.get_route_display()
        status = self.get_status_display()
        date = self.shift_iteration.date.strftime('%m/%d/%Y')
        return (driver_name + " driving shuttle#" + shuttle + " on route " + route + "(" + status + ") on " + date)

    def get_status_display(self):
        if self.status is 'O':
            return 'Ongoing'
        return 'Finished'

    def get_route_display(self):
        if self.route is 'M':
            return 'Main Road'
        elif self.route is 'R':
            return 'Right Route'
        return 'Left Route'

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Deployment, self).save(*args, **kwargs)

    def end_deployment(self):
        self.end_time = datetime.now()
        self.status = 'F'
        self.save()

    def set_deployment_success(self):
        self.result = 'S'
        self.save()

    def set_deployment_early(self):
        self.result = 'E'
        self.save()

    def set_deployment_breakdown(self):
        self.result = 'B'
        self.save()


class SubbedDeployments(models.Model):
    deployment = ForeignKey(Deployment, on_delete=models.CASCADE)
    absent_driver = ForeignKey(DriversAssigned, on_delete=models.CASCADE)

    def __str__(self):
        date = self.deployment.shift_iteration.date.strftime('%m/%d/%Y')
        return self.deployment.driver.name + " subbbed in for " + self.absent_driver.driver.name + " (" + date + ")"


class Redeployments(models.Model):
    deployment = ForeignKey(Deployment, related_name="deployment", on_delete=models.CASCADE)
    prior_deployment = ForeignKey(Deployment, related_name="prior_deployment", on_delete=models.CASCADE)


class AssignedTicket(models.Model):
    driver = ForeignKey(Driver, on_delete=models.CASCADE)
    range_from = IntegerField(null=True)
    range_to = IntegerField(null=True)
    type = CharField(max_length=1, choices=TICKET_TYPE)
    is_consumed = BooleanField(default=False)
    created = models.DateTimeField(editable=False, default=timezone.now)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(AssignedTicket, self).save(*args, **kwargs)

    def __str__(self):
        return self.get_type_display() + ": " + str(self.range_from) + " - " + str(self.range_to)

    def compute_range_to(self, value):
        self.range_to = self.range_from + int(value) - 1  # value is per bundle needs to minus 1
        self.save()


class VoidTicket(models.Model):
    assigned_ticket = ForeignKey(AssignedTicket, on_delete=models.CASCADE)
    ticket_number = IntegerField()


class RemittanceForm(models.Model):
    deployment = ForeignKey(Deployment, on_delete=models.CASCADE)
    fuel_cost = DecimalField(default=0, max_digits=19, decimal_places=10)
    fuel_receipt = CharField(max_length=36, null=True)
    other_cost = DecimalField(default=0, max_digits=19, decimal_places=10)
    status = CharField(max_length=1, choices=FORM_STATUS, default='P')
    total = DecimalField(default=0, max_digits=19, decimal_places=10)  # income - costs
    km_from = DecimalField(default=0, max_digits=19, decimal_places=10)
    km_to = DecimalField(default=0, max_digits=19, decimal_places=10)
    discrepancy = DecimalField(default=0, max_digits=19, decimal_places=10)
    created = models.DateTimeField(editable=False)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(RemittanceForm, self).save(*args, **kwargs)

    def confirm_remittance(self):
        self.status = 'C'  # set status to confirmed
        self.save()

    def get_remittances_only(self):
        costs = 0
        if self.fuel_cost is not None:
            costs += self.fuel_cost
        if self.other_cost is not None:
            costs += self.other_cost
        return self.total + costs


class ConsumedTicket(models.Model):
    remittance_form = ForeignKey(RemittanceForm, on_delete=models.CASCADE)
    assigned_ticket = ForeignKey(AssignedTicket, on_delete=models.CASCADE)
    start_ticket = IntegerField(default=0)
    end_ticket = IntegerField()
    total = DecimalField(default=0, null=True, max_digits=19, decimal_places=10)

    def __str__(self):
        return str(self.assigned_ticket.id) +" - Tickets: (" + str(self.assigned_ticket.range_from) + "-" + str(self.assigned_ticket.range_to) + ") Consumed: (" + str(self.start_ticket) + "-" + str(self.end_ticket) + ")"

class BeepShift(models.Model):
    type = CharField(max_length=1, choices=SHIFT_TYPE)
    date = DateField(null=True)


class BeepTransaction(models.Model):
    shift = ForeignKey(BeepShift, on_delete=models.CASCADE)
    card_number = CharField(null=True, max_length=20)
    total = DecimalField(default=0, max_digits=19, decimal_places=10)
    transaction_date_time = DateTimeField()
    card_profile_name = CharField(null=True, max_length=56)
    shuttle = ForeignKey(Shuttle,on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        return super(BeepTransaction, self).save(*args, **kwargs)


class CarwashTransaction(models.Model):
    date = DateField()
    member = ForeignKey(Member, on_delete=models.CASCADE)
    receipt = CharField(null=True, max_length=20)
    total = DecimalField(default=0, max_digits=19, decimal_places=10)
    photo = FileField(default='client/src/images/default.png', null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        return super(CarwashTransaction, self).save(*args, **kwargs)
