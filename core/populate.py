from datetime import timedelta
from remittances.models import *
from members.models import *

class PopulateDatabase():
    @staticmethod
    def main(start_date, end_date):
        current_date = datetime.strftime(start_date, '%Y-%m-%d')

        pop = PopulateDatabase()

        while current_date <= end_date:
            sched = pop.create_schedule(current_date, current_date)


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
        supervisors_assigned = []
        drivers_assigned = []

        for shift in shifts:
            pending_for_supervisor = True

            while pending_for_supervisor:
                supervisor = Supervisor.objects.random()
                if (supervisor.id in supervisors_assigned) == False:
                    supervisors_assigned.append(supervisor.id)
                    pending_for_supervisor = False

            drivers_assigned = PopulateDatabase.create_shift(
                schedule=schedule,
                type=shift,
                current_date=current_date,
                supervisor=supervisor,
                drivers_assigned=drivers_assigned
            )


    @staticmethod
    def create_shift(schedule, supervisor, type, current_date, drivers_assigned):
        shift = Shift.objects.create(
            type=type,
            schedule=schedule,
            supervisor=supervisor,
            created=current_date,
            modified=current_date
        )

        # expects that there are 14 drivers in the DB
        ctr = 0
        shuttles_assigned = []
        while ctr < 7:
            pending_driver = True
            pending_shuttle = True

            while pending_driver:
                driver = Driver.objects.random()
                if (driver.id in drivers_assigned) == False:
                    drivers_assigned.append(driver.id)
                    pending_driver = False

            while pending_shuttle:
                shuttle = Shuttle.objects.random()
                if (shuttle.id in shuttles_assigned) == False:
                    shuttles_assigned.append(shuttle.id)
                    pending_shuttle = False

            PopulateDatabase.assign_driver(
                shift=shift,
                shuttle=shuttle,
                deployment_type="Regular",
                driver=driver
            )

        return drivers_assigned


    @staticmethod
    def assign_driver(shift, shuttle, deployment_type, driver):
        return DriversAssigned.objects.create(
            driver=driver,
            deployment_type=deployment_type,
            shift=shift,
            shuttle=shuttle
        )