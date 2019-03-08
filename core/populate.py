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
        vendor = Vendor(name="Ace Hardware", address="12 Karilagan St., Pasig City", contact_number="09178712380")
        vendor.save()
        vendor2 = Vendor(name="Handyman", address="5th Floor Megamall, Ortigas Avenue", contact_number="09266323535")
        vendor2.save()
        vendor3 = Vendor(name="Budjolex", address="427 Bel-air, Sta. Rosa City, Laguna", contact_number="09153552690")
        vendor3.save()
        category_oil = ItemCategory(category='Oil', code_prefix='OIL', quantity=0)
        category_oil.save()
        category_tire = ItemCategory(category='Tire', code_prefix='TIR', quantity=0)
        category_tire.save()
        category_windshield = ItemCategory(category='Windshield Wiper', code_prefix='WWR', quantity=0)
        category_windshield.save()
        category_light_bulb = ItemCategory(category="Light Bulb", code_prefix='LBB', quantity=0)
        category_light_bulb.save()
        category_brake_pad = ItemCategory(category="Brake Pads", code_prefix='BRP', quantity=0)
        category_brake_pad.save()
        category_brake_fluid = ItemCategory(category="Brake Fluid", code_prefix='BRF', quantity=0)
        category_brake_fluid.save()

        purchase_order_1 = PurchaseOrder(po_number=1, vendor=vendor,
                                         order_date=datetime.strptime('27122018', "%d%m%Y").date(),
                                         completion_date=datetime.strptime('01012019', "%d%m%Y").date(),
                                         status="Complete")
        purchase_order_1.save()
        purchase_order_1_item_1 = PurchaseOrderItem(quantity=4, description="Windshield wiper for Toyota L300",
                                                    unit_price=200, category=category_windshield,
                                                    item_type="Physical Measurement", measurement=2, unit="pieces",
                                                    brand="Vew Clear",
                                                    delivery_date=datetime.strptime('01012019', "%d%m%Y").date(),
                                                    received=True)
        purchase_order_1_item_1.save()

        item = Item(category=category_windshield,
                    description="Windshield wiper for Toyota L300",
                    quantity=4,
                    brand="Vew Clear",
                    unit_price=200,
                    item_type="Physical Measurement",
                    measurement=2, unit="pieces", vendor=vendor,
                    item_code="WWR001", delivery_date=datetime.strptime('01012019', "%d%m%Y").date())
        item.save()
        itemMovement = ItemMovement(item=item,
                                    type="B",
                                    quantity=6,
                                    vendor="Lazada",
                                    unit_price=150,
                                    created=datetime.strptime(
                                        '01112018', "%d%m%Y").date())
        itemMovement.save()

        item2 = Item(name="Signal Lightbulb",
                     description="Can be used for brake light or turn signal lights",
                     quantity=8,
                     brand="TTW",
                     consumable=False,
                     average_price=250)
        item2.save()
        itemMovement2 = ItemMovement(item=item2,
                                     type="B",
                                     quantity=10,
                                     vendor="Ace Hardware",
                                     unit_price=250,
                                     created=datetime.strptime(
                                         '02112018', "%d%m%Y").date())
        itemMovement2.save()

        item_movement_1 = ItemMovement(item=item,
                                       type="B",
                                       quantity=4,
                                       unit_price=200,
                                       created=datetime.strptime(
                                           '01012019', "%d%m%Y").date())
        item_movement_1.save()

        category_windshield.quantity = 4
        category_windshield.save()

        purchase_order_1_item_2 = PurchaseOrderItem(quantity=8,
                                                    description="Can be used for brake light or turn signal lights",
                                                    unit_price=250, category=category_light_bulb,
                                                    item_type="Physical Measurement", measurement=10, unit="pieces",
                                                    brand="TTW",
                                                    delivery_date=datetime.strptime('01012019', "%d%m%Y").date(),
                                                    received=True)
        purchase_order_1_item_2.save()

        item2 = Item(category=category_light_bulb,
                     description="Can be used for brake light or turn signal lights",
                     quantity=8,
                     brand="TTW",
                     unit_price=250,
                     item_type="Physical Measurement",
                     measurement=10, unit="pieces", vendor=vendor,
                     item_code="LBB001", delivery_date=datetime.strptime('01012019', "%d%m%Y").date())
        item2.save()
        item_movement_2 = ItemMovement(item=item2,
                                       type="B",
                                       quantity=8,
                                       unit_price=250,
                                       created=datetime.strptime(
                                           '01012019', "%d%m%Y").date())
        item_movement_2.save()

        purchase_order_2 = PurchaseOrder(po_number=2, vendor=vendor,
                                         order_date=datetime.strptime('02142019', "%d%m%Y").date(),
                                         completion_date=datetime.strptime('02172019', "%d%m%Y").date(),
                                         status="Complete")
        purchase_order_2.save()

        purchase_order_2_item_1 = PurchaseOrderItem(quantity=5, description="Pair of brake pads for Mitsubishi L300",
                                                    unit_price=800, category=category_brake_pad,
                                                    item_type="Physical Measurement", measurement=2, unit="pieces",
                                                    brand="Akebono",
                                                    delivery_date=datetime.strptime('02172019', "%d%m%Y").date(),
                                                    received=True)
        purchase_order_1_item_1.save()

        item3 = Item(name="Front Brake Pads",
                     description="Pair of brake pads for Mitsubishi L300",
                     quantity=5,
                     brand="Akebono",
                     consumable=False,
                     average_price=1300)
        item3.save()

        itemMovement3 = ItemMovement(item=item3,
                                     type="B",
                                     quantity=9,
                                     vendor="Ace Hardware",
                                     unit_price=1300,
                                     created=datetime.strptime(
                                         '01112018', "%d%m%Y").date())
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
                                     unit_price=230,
                                     created=datetime.strptime(
                                         '01112018', "%d%m%Y").date())
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
                                     unit_price=455,
                                     created=datetime.strptime(
                                         '01112018', "%d%m%Y").date()
                                     )
        itemMovement5.save()

        item6 = Item(name="Tire Valve Cap",
                     description="For Tires",
                     quantity=14,
                     brand="OEM",
                     consumable=False,
                     average_price=25)
        item6.save()

        itemMovement6 = ItemMovement(item=item6,
                                     type="B",
                                     quantity=16,
                                     vendor="Ace Hardware",
                                     unit_price=25,
                                     created=datetime.strptime(
                                         '01112018', "%d%m%Y").date())
        itemMovement6.save()

        item7 = Item(name="Tire",
                     description="Tires for L300",
                     quantity=4,
                     brand="Thunderer",
                     consumable=False,
                     average_price=2860)
        item7.save()

        itemMovement7 = ItemMovement(item=item7,
                                     type="B",
                                     quantity=6,
                                     vendor="Goodyear",
                                     unit_price=2860,
                                     created=datetime.strptime(
                                         '01112018', "%d%m%Y").date())
        itemMovement7.save()

    @staticmethod
    def populate_shuttle():
        shuttle1 = Shuttle(plate_number="WGV636",
                           shuttle_number="1",
                           make="Toyota",
                           model="L300",
                           status="A",
                           purchase_price=randint(500000, 800000),
                           salvage_value=randint(100000, 200000),
                           lifespan=randint(60, 120),
                           date_acquired=datetime.strptime(
                               '24052018', "%d%m%Y").date(),
                           mileage=500,
                           route="M",
                           dayoff_date="Monday"
                           )
        shuttle1.save()
        shuttle2 = Shuttle(shuttle_number="2",
                           plate_number="XLZ502",
                           make="Toyota",
                           model="L300",
                           status="A",
                           purchase_price=randint(500000, 800000),
                           salvage_value=randint(100000, 200000),
                           lifespan=randint(60, 120),
                           date_acquired=datetime.strptime(
                               '24052018', "%d%m%Y").date(),
                           mileage=500,
                           route="M",
                           dayoff_date="Tuesday")
        shuttle2.save()
        shuttle3 = Shuttle(shuttle_number="3",
                           plate_number="UF7087",
                           make="Toyota",
                           model="L300",
                           status="A",
                           purchase_price=randint(500000, 800000),
                           salvage_value=randint(100000, 200000),
                           lifespan=randint(60, 120),
                           date_acquired=datetime.strptime(
                               '24052018', "%d%m%Y").date(),
                           mileage=500,
                           route="M",
                           dayoff_date="Wednesday")
        shuttle3.save()
        shuttle4 = Shuttle(shuttle_number="4",
                           plate_number="AB5225",
                           make="Toyota",
                           model="L300",
                           purchase_price=randint(500000, 800000),
                           salvage_value=randint(100000, 200000),
                           lifespan=randint(60, 120),
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052018', "%d%m%Y").date(),
                           mileage=500,
                           route="L",
                           dayoff_date="Thursday")
        shuttle4.save()
        shuttle5 = Shuttle(shuttle_number="5",
                           plate_number="UF6862",
                           make="Toyota",
                           model="L300",
                           purchase_price=randint(500000, 800000),
                           salvage_value=randint(100000, 200000),
                           lifespan=randint(60, 120),
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052018', "%d%m%Y").date(),
                           mileage=500,
                           route="L",
                           dayoff_date="Friday")
        shuttle5.save()
        shuttle6 = Shuttle(shuttle_number="6",
                           plate_number="VO5030",
                           make="Toyota",
                           model="L300",
                           purchase_price=randint(500000, 800000),
                           salvage_value=randint(100000, 200000),
                           lifespan=randint(60, 120),
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052018', "%d%m%Y").date(),
                           mileage=500,
                           route="R",
                           dayoff_date="Saturday")
        shuttle6.save()
        shuttle7 = Shuttle(shuttle_number="7",
                           plate_number="WD5363",
                           make="Toyota",
                           model="L300",
                           status="A",
                           purchase_price=randint(500000, 800000),
                           salvage_value=randint(100000, 200000),
                           lifespan=randint(60, 120),
                           date_acquired=datetime.strptime(
                               '24052018', "%d%m%Y").date(),
                           mileage=500,
                           route="R",
                           dayoff_date="Sunday")
        shuttle7.save()
        shuttle8 = Shuttle(shuttle_number="8",
                           plate_number="YR8953",
                           make="Toyota",
                           model="L300",
                           purchase_price=randint(500000, 800000),
                           salvage_value=randint(100000, 200000),
                           lifespan=randint(60, 120),
                           status="A",
                           date_acquired=datetime.strptime(
                               '24052018', "%d%m%Y").date(),
                           mileage=500,
                           route="B",
                           dayoff_date="Back-up")
        shuttle8.save()
        shuttle9 = Shuttle(shuttle_number="9",
                           plate_number="DS2110",
                           make="Toyota",
                           model="L300",
                           status="A",
                           purchase_price=randint(500000, 800000),
                           salvage_value=randint(100000, 200000),
                           lifespan=randint(60, 120),
                           date_acquired=datetime.strptime(
                               '24052018', "%d%m%Y").date(),
                           mileage=500,
                           route="B",
                           dayoff_date="Back-up")
        shuttle9.save()

    @staticmethod
    def populate_repairs():

        # Shuttle 1
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
                                     quantity=1,
                                     repair=repair1,
                                     created=datetime.strptime('16112018', "%d%m%Y").date())
        itemMovement1.save()
        repair1.problems.add(rp1)
        repair1.modifications.add(rm1)

        repair2 = Repair(shuttle=Shuttle.objects.get(pk=1),
                         date_requested=datetime.strptime('18112018', "%d%m%Y").date(),
                         start_date=datetime.strptime('18112018', "%d%m%Y").date(),
                         end_date=datetime.strptime('18112018', "%d%m%Y").date(),
                         status="C",
                         maintenance=False)
        repair2.save()
        item2 = Item.objects.get(pk=1)
        rp2 = RepairProblem(description="Broken Windshield")
        rp2.save()
        rm2 = RepairModifications(item_used=item2,
                                  quantity=1,
                                  used_up=False)
        rm2.save()
        itemMovement2 = ItemMovement(item=item2,
                                     type="G",
                                     quantity=1,
                                     repair=repair2,
                                     created=datetime.strptime('18112018', "%d%m%Y").date())
        itemMovement2.save()
        repair2.problems.add(rp2)
        repair2.modifications.add(rm2)

        ## Shuttle 2
        repair3 = Repair(shuttle=Shuttle.objects.get(pk=2),
                         date_requested=datetime.strptime(
                             '01112018', "%d%m%Y").date(),
                         start_date=datetime.strptime(
                             '01112018', "%d%m%Y").date(),
                         end_date=datetime.strptime(
                             '02112018', "%d%m%Y").date(),
                         status="C",
                         maintenance=False)
        repair3.save()
        item3 = Item.objects.get(pk=2)
        rp3 = RepairProblem(description="Left blinker not working")
        rp3.save()
        rm3 = RepairModifications(item_used=item3,
                                  quantity=1,
                                  used_up=False)
        rm3.save()
        itemMovement3 = ItemMovement(item=item3,
                                     type="G",
                                     quantity=1,
                                     repair=repair3,
                                     created=datetime.strptime(
                                         '01112018', "%d%m%Y").date())
        itemMovement3.save()
        repair3.problems.add(rp3)
        repair3.modifications.add(rm3)

        ## Shuttle 3
        repair4 = Repair(shuttle=Shuttle.objects.get(pk=3),
                         date_requested=datetime.strptime(
                             '05112018', "%d%m%Y").date(),
                         start_date=datetime.strptime(
                             '05112018', "%d%m%Y").date(),
                         end_date=datetime.strptime(
                             '05112018', "%d%m%Y").date(),
                         status="C",
                         maintenance=False)
        repair4.save()
        item4 = Item.objects.get(pk=3)
        rp4 = RepairProblem(description="Worn out front brakes")
        rp4.save()
        rm4 = RepairModifications(item_used=item4,
                                  quantity=2,
                                  used_up=False)
        rm4.save()
        itemMovement4 = ItemMovement(item=item4,
                                     type="G",
                                     quantity=2,
                                     repair=repair4,
                                     created=datetime.strptime(
                                         '05112018', "%d%m%Y").date())
        itemMovement4.save()
        repair4.problems.add(rp4)
        repair4.modifications.add(rm4)

        repair5 = Repair(shuttle=Shuttle.objects.get(pk=3),
                         date_requested=datetime.strptime(
                             '13112018', "%d%m%Y").date(),
                         start_date=datetime.strptime(
                             '14112018', "%d%m%Y").date(),
                         end_date=datetime.strptime(
                             '15112018', "%d%m%Y").date(),
                         status="C",
                         maintenance=True)
        repair5.save()
        item5 = Item.objects.get(pk=6)
        rp5 = RepairProblem(description="Lost Tire Cap")
        rp5.save()
        rm5 = RepairModifications(item_used=item5,
                                  quantity=1,
                                  used_up=False)
        rm5.save()
        itemMovement5 = ItemMovement(item=item5,
                                     type="G",
                                     quantity=1,
                                     repair=repair5,
                                     created=datetime.strptime(
                                         '14112018', "%d%m%Y").date())
        itemMovement5.save()
        repair5.problems.add(rp5)
        repair5.modifications.add(rm5)

        ## Shuttle 4
        repair6 = Repair(shuttle=Shuttle.objects.get(pk=4),
                         date_requested=datetime.strptime(
                             '13112018', "%d%m%Y").date(),
                         start_date=datetime.strptime(
                             '14112018', "%d%m%Y").date(),
                         end_date=datetime.strptime(
                             '15112018', "%d%m%Y").date(),
                         status="C",
                         maintenance=True)
        repair6.save()
        item6 = Item.objects.get(pk=6)
        rp6 = RepairProblem(description="Lost Tire Cap")
        rp6.save()
        rm6 = RepairModifications(item_used=item6,
                                  quantity=1,
                                  used_up=False)
        rm6.save()
        itemMovement6 = ItemMovement(item=item6,
                                     type="G",
                                     quantity=1,
                                     repair=repair6,
                                     created=datetime.strptime(
                                         '14112018', "%d%m%Y").date())
        itemMovement6.save()
        repair6.problems.add(rp6)
        repair6.modifications.add(rm6)

        shuttle4Repair = Repair(shuttle=Shuttle.objects.get(pk=4),
                                date_requested=datetime.strptime(
                                    '17112018', "%d%m%Y").date(),
                                start_date=datetime.strptime(
                                    '17112018', "%d%m%Y").date(),
                                end_date=datetime.strptime(
                                    '19112018', "%d%m%Y").date(),
                                status="C",
                                maintenance=False,
                                labor_fee=4000)

        shuttle4Repair.save()
        s4rp = RepairProblem(description="Engine Failure")
        s4rp.save()
        outsourced_item1 = OutSourcedItems(item="Engine",
                                           quantity=1,
                                           unit_price=15000)
        outsourced_item1.save()
        shuttle4Repair.problems.add(s4rp)
        shuttle4Repair.outsourced_items.add(outsourced_item1)

        ## Shuttle 5
        repair7 = Repair(shuttle=Shuttle.objects.get(pk=5),
                         date_requested=datetime.strptime(
                             '11112018', "%d%m%Y").date(),
                         start_date=datetime.strptime(
                             '11112018', "%d%m%Y").date(),
                         end_date=datetime.strptime(
                             '11112018', "%d%m%Y").date(),
                         status="C",
                         maintenance=False)
        repair7.save()
        item7 = Item.objects.get(pk=2)
        rp7 = RepairProblem(description="Right blinker not working")
        rp7.save()
        rm7 = RepairModifications(item_used=item7,
                                  quantity=1,
                                  used_up=False)
        rm7.save()
        itemMovement7 = ItemMovement(item=item7,
                                     type="G",
                                     quantity=1,
                                     repair=repair7,
                                     created=datetime.strptime(
                                         '11112018', "%d%m%Y").date())
        itemMovement7.save()
        repair7.problems.add(rp7)
        repair7.modifications.add(rm7)

        ## Shuttle 6
        repair8 = Repair(shuttle=Shuttle.objects.get(pk=6),
                         date_requested=datetime.strptime(
                             '13112018', "%d%m%Y").date(),
                         start_date=datetime.strptime(
                             '13112018', "%d%m%Y").date(),
                         end_date=datetime.strptime(
                             '13112018', "%d%m%Y").date(),
                         status="C",
                         maintenance=False)
        repair8.save()
        item8 = Item.objects.get(pk=7)
        rp8 = RepairProblem(description="Flat Tire")
        rp8.save()
        rm8 = RepairModifications(item_used=item8,
                                  quantity=1,
                                  used_up=False)
        rm8.save()
        itemMovement8 = ItemMovement(item=item8,
                                     type="G",
                                     quantity=1,
                                     repair=repair8,
                                     created=datetime.strptime(
                                         '13112018', "%d%m%Y").date())
        itemMovement8.save()
        repair8.problems.add(rp8)
        repair8.modifications.add(rm8)

        ## Shuttle 7 
        repair9 = Repair(shuttle=Shuttle.objects.get(pk=7),
                         date_requested=datetime.strptime(
                             '15112018', "%d%m%Y").date(),
                         start_date=datetime.strptime(
                             '16112018', "%d%m%Y").date(),
                         end_date=datetime.strptime(
                             '17112018', "%d%m%Y").date(),
                         status="C",
                         maintenance=True)
        repair9.save()
        item9 = Item.objects.get(pk=4)
        rp9 = RepairProblem(description="Radiator Coolant Low")
        rp9.save()
        rm9 = RepairModifications(item_used=item9,
                                  quantity=1,
                                  used_up=False)
        rm9.save()
        itemMovement9 = ItemMovement(item=item9,
                                     type="G",
                                     quantity=1,
                                     repair=repair9,
                                     created=datetime.strptime(
                                         '16112018', "%d%m%Y").date())
        itemMovement9.save()
        repair9.problems.add(rp9)
        repair9.modifications.add(rm9)

        ## Shuttle 8
        repair10 = Repair(shuttle=Shuttle.objects.get(pk=8),
                          date_requested=datetime.strptime(
                              '02112018', "%d%m%Y").date(),
                          start_date=datetime.strptime(
                              '02112018', "%d%m%Y").date(),
                          end_date=datetime.strptime(
                              '02112018', "%d%m%Y").date(),
                          status="C",
                          maintenance=False)
        repair10.save()
        item10 = Item.objects.get(pk=7)
        rp10 = RepairProblem(description="Flat Tire")
        rp10.save()
        rm10 = RepairModifications(item_used=item10,
                                   quantity=1,
                                   used_up=False)
        rm10.save()
        itemMovement10 = ItemMovement(item=item10,
                                      type="G",
                                      quantity=1,
                                      repair=repair10,
                                      created=datetime.strptime(
                                          '02112018', "%d%m%Y").date())
        itemMovement10.save()
        repair10.problems.add(rp10)
        repair10.modifications.add(rm10)

        ## Shuttle 9
        repair11 = Repair(shuttle=Shuttle.objects.get(pk=9),
                          date_requested=datetime.strptime(
                              '11112018', "%d%m%Y").date(),
                          start_date=datetime.strptime(
                              '11112018', "%d%m%Y").date(),
                          end_date=datetime.strptime(
                              '11112018', "%d%m%Y").date(),
                          status="C",
                          maintenance=False)
        repair11.save()
        item11 = Item.objects.get(pk=3)
        rp11 = RepairProblem(description="Worn out front brakes")
        rp11.save()
        rm11 = RepairModifications(item_used=item11,
                                   quantity=2,
                                   used_up=False)
        rm11.save()
        itemMovement11 = ItemMovement(item=item11,
                                      type="G",
                                      quantity=2,
                                      repair=repair11,
                                      created=datetime.strptime(
                                          '11112018', "%d%m%Y").date())
        itemMovement11.save()
        repair11.problems.add(rp11)
        repair11.modifications.add(rm11)
