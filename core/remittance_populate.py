from datetime import timedelta
from remittances.models import *
from members.models import *
from inventory.models import *

class PopulateRemittances():
    @staticmethod
    def main(start_date, end_date):
        current_date = datetime.strptime(start_date, '%Y-%m-%d')
        new_end_date = datetime.strptime(end_date, '%Y-%m-%d')
        pop = PopulateRemittances()

        while current_date <= new_end_date:
            sched = pop.create_schedule(current_date, current_date)

            temp_date = current_date

            while temp_date < current_date + timedelta(days=15):
                #create deployments
                ctr = 0
                # there are twice the deployments in a day
                while ctr < 2:
                    if ctr == 0:
                        shift = Shift.objects.get(schedule=sched, type='A')
                    else:
                        shift = Shift.objects.get(schedule=sched, type='P')

                    shift_iteration = pop.start_shift_iteration(temp_date, shift)

                    ctr += 1

                temp_date = temp_date + timedelta(days=1)

            current_date = current_date + timedelta(days=15)

    @staticmethod
    def create_schedule(start_date, current_date):
        schedule = Schedule.objects.create(
            start_date=start_date,
            end_date=(start_date + timedelta(days=14)),
            created=current_date,
            modified=current_date
        )

        # create shifts for every schedule
        shifts = ['A', 'P']

        supervisor_ids = [1, 2, 3]
        driver_ids_odd = [4, 5, 6, 7, 8, 9, 10]
        driver_ids_even = [11, 12, 13, 14, 15, 16, 17]

        ctr = 1
        for shift in shifts:
            supervisor = Supervisor.objects.get(id=supervisor_ids[ctr-1])

            if ctr % 2 == 0:
                drivers = driver_ids_even
            else:
                drivers = driver_ids_odd

            PopulateRemittances.create_shift(
                schedule=schedule,
                type=shift,
                current_date=current_date,
                supervisor=supervisor,
                drivers=drivers
            )
            ctr += 1

        return schedule

    @staticmethod
    def create_shift(schedule, supervisor, type, current_date, drivers):
        shift = Shift.objects.create(
            type=type,
            schedule=schedule,
            supervisor=supervisor,
            created=current_date,
            modified=current_date
        )

        shuttle_ids = [1,2,3,4,5,6,7]
        ctr = 0
        for driver in drivers:
            DriversAssigned.objects.create(
                driver_id=driver,
                deployment_type="Regular",
                shift=shift,
                shuttle_id=shuttle_ids[ctr]
            )

    @staticmethod
    def start_shift_iteration(date, shift):
        return ShiftIteration.objects.create(
            date=date,
            shift=shift
        )
