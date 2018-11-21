from datetime import timedelta
from datetime import datetime
from remittances.models import *
from members.models import *
from inventory.models import *


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

    @staticmethod
    def populate_inventory():
        item = Item(name="Windshield Wiper",
                    description="Windshield wiper for Toyota L300",
                    quantity=6,
                    brand="Vew Clear",
                    consumable=False,
                    average_price=150)
        item.save()
        itemMovement = ItemMovement(item=item,
                                    type="B",
                                    quantity=6,
                                    vendor="Lazada",
                                    unit_price=150)
        itemMovement.save()

        item2 = Item(name="Signal Lightbulb",
                    description="Can be used for brake light or turn signal lights",
                    quantity=10,
                    brand="TTW",
                    consumable=False,
                    average_price=250)
        item2.save()
        itemMovement2 = ItemMovement(item=item2,
                                    type="B",
                                    quantity=10,
                                    vendor="Ace Hardware",
                                    unit_price=250)
        itemMovement2.save()

        item3 = Item(name="Front Brake Pads",
                     description="Pair of brake pads for Mitsubishi L300",
                     quantity=9,
                     brand="Akebono",
                     consumable=False,
                     average_price=1300)
        item3.save()

        itemMovement3 = ItemMovement(item=item3,
                                     type="B",
                                     quantity=9,
                                     vendor="Ace Hardware",
                                     unit_price=1300)
        itemMovement3.save()

        item4 = Item(name="Radiator Coolant",
                     description="Total Hi-concentrate Radiator Coolant",
                     quantity=6,
                     brand="Total",
                     consumable=True,
                     average_price=230)
        item4.save()

        itemMovement4 = ItemMovement(item=item4,
                                     type="B",
                                     quantity=6,
                                     vendor="Total",
                                     unit_price=230)
        itemMovement4.save()

        item5 = Item(name="Engine Oil",
                     description="Synthetic Performance Gasoline Oil",
                     quantity=5,
                     brand="Apex",
                     consumable=True,
                     average_price=455)
        item5.save()

        itemMovement5 = ItemMovement(item=item5,
                                     type="B",
                                     quantity=5,
                                     vendor="Shell",
                                     unit_price=455)
        itemMovement5.save()

        item6 = Item(name="Tire Valve Cap",
                     description="For Tires",
                     quantity=16,
                     brand="OEM",
                     consumable=False,
                     average_price=25)
        item6.save()

        itemMovement6 = ItemMovement(item=item6,
                                     type="B",
                                     quantity=16,
                                     vendor="Ace Hardware",
                                     unit_price=25)
        itemMovement6.save()

        item7 = Item(name="Tire",
                     description="Tires for L300",
                     quantity=6,
                     brand="Thunderer",
                     consumable=False,
                     average_price=2860)
        item7.save()

        itemMovement7 = ItemMovement(item=item7,
                                     type="B",
                                     quantity=6,
                                     vendor="Goodyear",
                                     unit_price=2860)
        itemMovement7.save()

    @staticmethod
    def populate_shuttle():
        shuttle1 = Shuttle(plate_number="WGV636",
                           make="Toyota",
                           model="L300",
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052016', "%d%m%Y").date(),
                           mileage=500,
                           route="M")
        shuttle1.save()
        shuttle2 = Shuttle(plate_number="XLZ502",
                           make="Toyota",
                           model="L300",
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052016', "%d%m%Y").date(),
                           mileage=500,
                           route="M")
        shuttle2.save()
        shuttle3 = Shuttle(plate_number="UF7087",
                           make="Toyota",
                           model="L300",
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052016', "%d%m%Y").date(),
                           mileage=500,
                           route="M")
        shuttle3.save()
        shuttle4 = Shuttle(plate_number="AB5225",
                           make="Toyota",
                           model="L300",
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052016', "%d%m%Y").date(),
                           mileage=500,
                           route="L")
        shuttle4.save()
        shuttle5 = Shuttle(plate_number="UF6862",
                           make="Toyota",
                           model="L300",
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052016', "%d%m%Y").date(),
                           mileage=500,
                           route="L")
        shuttle5.save()
        shuttle6 = Shuttle(plate_number="VO5030",
                           make="Toyota",
                           model="L300",
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052016', "%d%m%Y").date(),
                           mileage=500,
                           route="R")
        shuttle6.save()
        shuttle7 = Shuttle(plate_number="WD5363",
                           make="Toyota",
                           model="L300",
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052016', "%d%m%Y").date(),
                           mileage=500,
                           route="R")
        shuttle7.save()
        shuttle8 = Shuttle(plate_number="YR8953",
                           make="Toyota",
                           model="L300",
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052016', "%d%m%Y").date(),
                           mileage=500,
                           route="B")
        shuttle8.save()
        shuttle9 = Shuttle(plate_number="DS2110",
                           make="Toyota",
                           model="L300",
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052016', "%d%m%Y").date(),
                           mileage=500,
                           route="B")
        shuttle9.save()

    @staticmethod
    def populate_repairs():
        repair1 = Repair(shuttle=Shuttle.objects.get(pk=1),
                         date_requested=datetime.strptime('15112018', "%d%m%Y").date(),
                         start_date=datetime.strptime('16112018', "%d%m%Y").date(),
                         end_date=datetime.strptime('17112018', "%d%m%Y").date(),
                         status="C",
                         maintenance=True)
        repair1.save()
        item1 = Item.objects.get(pk=1)
        rp1 = RepairProblem(description="Maintenance")
        rp1.save()
        rm1 = RepairModifications(item_used=item1,
                                 quantity=1,
                                 used_up=False)
        rm1.save()
        itemMovement1 = ItemMovement(item=item1,
                                     type="G",
                                     quantity="1",
                                     repair=repair1)
        itemMovement1.save()
        repair1.problems.add(rp1)
        repair1.modifications.add(rm1)
