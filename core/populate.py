from datetime import timedelta
from datetime import datetime
from remittances.models import *
from members.models import *
from inventory.models import *
import random


class PopulateDatabase:
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
                if supervisor.id not in supervisors_assigned:
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
                if driver.id not in drivers_assigned:
                    drivers_assigned.append(driver.id)
                    pending_driver = False

            while pending_shuttle:
                shuttle = Shuttle.objects.random()
                if shuttle.id not in shuttles_assigned == False:
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
        vendor4 = Vendor(name="Laguna Equipment", address="759 Saturn St., Sta. Rosa City, Laguna",
                         contact_number="09173512562")
        vendor4.save()
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
        purchase_order_1.po_items.add(purchase_order_1_item_1)
        item = Item(category=category_windshield,
                    description="Windshield wiper for Toyota L300",
                    quantity=4,
                    purchase_order=purchase_order_1,
                    brand="Vew Clear",
                    unit_price=200,
                    item_type="Physical Measurement",
                    measurement=2, unit="pieces", vendor=vendor, current_measurement=2,
                    item_code="WWR001", delivery_date=datetime.strptime('01012019', "%d%m%Y").date())
        item.save()
        item_movement = ItemMovement(item=item,
                                     type="B",
                                     quantity=6,
                                     unit_price=150,
                                     created=datetime.strptime(
                                         '01112018', "%d%m%Y").date())
        item_movement.save()

        category_windshield.quantity = 8
        category_windshield.save()

        item2 = Item(category=category_light_bulb,
                     description="Can be used for brake light or turn signal lights",
                     quantity=8,
                     purchase_order=purchase_order_1,
                     brand="TTW",
                     vendor=vendor,
                     unit_price=250, item_type="Single Item", item_code="LBB001",
                     delivery_date=datetime.strptime('01012019', "%d%m%Y").date())
        item2.save()
        item_movement_2 = ItemMovement(item=item2,
                                       type="B",
                                       quantity=10,
                                       unit_price=250,
                                       created=datetime.strptime(
                                           '02112018', "%d%m%Y").date())
        item_movement_2.save()
        category_light_bulb.quantity = 8
        category_light_bulb.save()

        purchase_order_1_item_2 = PurchaseOrderItem(quantity=8,
                                                    description="Can be used for brake light or turn signal lights",
                                                    unit_price=250, category=category_light_bulb,
                                                    item_type="Physical Measurement", measurement=10, unit="pieces",
                                                    brand="TTW",
                                                    delivery_date=datetime.strptime('01012019', "%d%m%Y").date(),
                                                    received=True)
        purchase_order_1_item_2.save()
        purchase_order_1.po_items.add(purchase_order_1_item_2)
        purchase_order_2 = PurchaseOrder(po_number=2, vendor=vendor2,
                                         order_date=datetime.strptime('14022019', "%d%m%Y").date(),
                                         completion_date=datetime.strptime('17022019', "%d%m%Y").date(),
                                         status="Complete")
        purchase_order_2.save()

        purchase_order_2_item_3 = PurchaseOrderItem(quantity=2, description="Pair of brake pads for Mitsubishi L300",
                                                    unit_price=800, category=category_brake_pad,
                                                    item_type="Physical Measurement", measurement=2, unit="pieces",
                                                    brand="Akebono",
                                                    delivery_date=datetime.strptime('17022019', "%d%m%Y").date(),
                                                    received=True)
        purchase_order_2_item_3.save()
        purchase_order_2.po_items.add(purchase_order_2_item_3)
        item3 = Item(category=category_brake_pad,
                     description="Pair of brake pads for Mitsubishi L300",
                     quantity=2,
                     purchase_order=purchase_order_2,
                     brand="Akebono",
                     vendor=vendor2,
                     item_code="BRP001",
                     unit_price=900,
                     item_type="Physical Measurement", current_measurement=2,
                     delivery_date=datetime.strptime('17022019', "%d%m%Y").date(),
                     measurement=2, unit="Pieces")
        item3.save()

        item_movement3 = ItemMovement(item=item3,
                                      type="B",
                                      quantity=5,
                                      unit_price=1300,
                                      created=datetime.strptime(
                                          '17022019', "%d%m%Y").date())
        item_movement3.save()

        purchase_order_2_item_4 = PurchaseOrderItem(quantity=5, description="Synthetic Performance Gasoline Oil",
                                                    unit_price=455, category=category_oil,
                                                    item_type="Liquid Measurement", measurement=400, unit="mL",
                                                    brand="Apex",
                                                    delivery_date=datetime.strptime('17022019', "%d%m%Y").date(),
                                                    received=True)

        purchase_order_2_item_4.save()
        purchase_order_2.po_items.add(purchase_order_2_item_4)
        category_brake_pad.quantity = 4
        category_brake_pad.save()

        item4 = Item(category=category_oil,
                     description="Synthetic Performance Gasoline Oil",
                     quantity=5,
                     purchase_order=purchase_order_2,
                     brand="Apex",
                     vendor=vendor2,
                     unit_price=455,
                     item_type="Liquid Measurement", current_measurement=400,
                     measurement=400, unit="mL", item_code="OIL001",
                     delivery_date=datetime.strptime('17022019', "%d%m%Y").date())
        item4.save()
        category_oil.quantity = 5
        category_oil.save()
        item_movement4 = ItemMovement(item=item4,
                                      type="B",
                                      quantity=5,
                                      unit_price=455,
                                      created=datetime.strptime(
                                          '17022019', "%d%m%Y").date())
        item_movement4.save()

        purchase_order_3 = PurchaseOrder(po_number=3, vendor=vendor4,
                                         order_date=datetime.strptime('05032019', "%d%m%Y").date(),
                                         completion_date=datetime.strptime('07032019', "%d%m%Y").date(),
                                         status="Complete")
        purchase_order_3.save()
        purchase_order_3_item_1 = PurchaseOrderItem(quantity=5,
                                                    description="Radial Tires",
                                                    unit_price=2500,
                                                    category=category_tire,
                                                    item_type="Single Item",
                                                    measurement=None,
                                                    unit=None,
                                                    brand="Goodyear",
                                                    delivery_date=datetime.strptime('06032019', "%d%m%Y").date(),
                                                    received=True)
        purchase_order_3_item_1.save()
        purchase_order_3.po_items.add(purchase_order_3_item_1)

        item_tire = Item(description="Radial Tires",
                         quantity=5,
                         category=category_tire,
                         unit_price=2500,
                         item_type="Single Item",
                         measurement=None,
                         unit=None,
                         brand="Goodyear",
                         vendor=vendor4,
                         delivery_date=datetime.strptime('06032019', "%d%m%Y"),
                         item_code='TIR001',
                         current_measurement=5,
                         purchase_order=purchase_order_3)
        item_tire.save()
        item_tire_movement = ItemMovement(item=item_tire,
                                          type="B",
                                          quantity=5,
                                          unit_price=2500,
                                          created=datetime.strptime('06032019', "%d%m%Y"))
        item_tire_movement.save()
        category_tire.quantity = 5
        category_tire.save()

        purchase_order_3_item_2 = PurchaseOrderItem(quantity=6,
                                                    description="Super Heavy duty brake and clutch fluid",
                                                    unit_price=250,
                                                    category=category_brake_fluid,
                                                    item_type="Liquid Measurement",
                                                    measurement=500,
                                                    unit="mL",
                                                    brand="Prestone",
                                                    delivery_date=datetime.strptime('07032019', "%d%m%Y").date(),
                                                    received=True)
        purchase_order_3_item_2.save()
        purchase_order_3.po_items.add(purchase_order_3_item_2)
        item_brake_fluid = Item(description="Super Heavy duty brake and clutch fluid",
                                quantity=6,
                                category=category_brake_fluid,
                                unit_price=250,
                                item_type="Liquid Measurement",
                                measurement=500,
                                unit="mL",
                                brand="Prestone",
                                vendor=vendor4,
                                item_code="BRF001",
                                delivery_date=datetime.strptime('07032019', "%d%m%Y"),
                                current_measurement=500,
                                purchase_order=purchase_order_3)
        item_brake_fluid.save()

        item_brake_fluid_movement = ItemMovement(item=item_brake_fluid,
                                                 type="B",
                                                 quantity=6,
                                                 unit_price=250,
                                                 created=datetime.strptime('07032019', "%d%m%Y"))
        item_brake_fluid_movement.save()
        category_brake_fluid.quantity = 6
        category_brake_fluid.save()

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
        # Add Maintenance schedule to repairs
        shuttles = Shuttle.objects.all()
        for shuttle in shuttles:
            shuttle.maintenance_sched = datetime.strptime('25032019', "%d%m%Y").date()
            shuttle.save()

        vendors = ["Ace Hardware", "Handyman", "Budjolex", "Laguna Equipment"]
        categories = ['Oil', 'Tire', 'Windshield Wiper', 'Light Bulb', 'Brake Pads', 'Brake Fluid']
        descriptions = {
            'Oil': ['Engine Oil Enhancer', 'Magnesium Oil', 'An Engine Ceramic coating technology that will coat your '
                                                            'metallic engine into ceramic'],
            'Tire': ['205/70R15 96H FM316 Quality SUV Radial Tire', 'PILOT STREET TT/TL',
                     '65/65R17 RANGER HT603 112H'],
            'Windshield Wiper': ['Silicone Wiper', 'Wiper Blade', '26" / 15" Aerotwin A432S '],
            'Light Bulb': ['200W', '350W', '300W'],
            'Brake Pads': ['GCT', 'KLE650', 'H4N'],
            'Brake Fluid': ['Silicone Compound', 'Hi Performance', 'DOT3']
        }
        brand = {
            'Oil': ['NOW21', 'X-1R', 'MD10'],
            'Tire': ['Goodyear', 'Michelin', 'Firemax'],
            'Windshield Wiper': ['Banana Blade', 'Black horse', 'Universal'],
            'Light Bulb': ['Eso goal', 'Coromose', 'H4'],
            'Brake Pads': ['Bendix', 'OEM', 'Hi Q'],
            'Brake Fluid': ['Dynatext', 'Rock Oil', 'Gas Treatment']
        }

        findings = {
            'Oil': ['Low oil', 'Faulty Oil'],
            'Tire': ["There's a hole", "The tire is smooth"],
            'Windshield Wiper': ["Old stock", 'Blade is broken'],
            'Light Bulb': ['Rand out of power', 'It broke'],
            'Brake Pads': ['Brake pads are smooth', 'The brake pad is cracked'],
            'Brake Fluid': ['Low fluid', 'Very viscous']
        }

        problems = {
            'Oil': ['Not running well', 'Making noises'],
            'Tire': ['Not running well', 'Too bumpy'],
            'Windshield Wiper': ['Making noise when wiping', 'Residue when wiping'],
            'Light Bulb': ['Flickering', 'No light'],
            'Brake Pads': ['Noise when braking', 'Not braking well'],
            'Brake Fluid': ['Noise when braking', 'Not braking well']
        }

        item_types = {
            'Oil': ['Liquid Measurement', 300, 'mL', 'OIL'],
            'Tire': ['Single Item', None, None, 'TIR'],
            'Windshield Wiper': ['Physical Measurement', 2, 'pieces', 'WWR'],
            'Light Bulb': ['Single Item', None, None, 'LBB'],
            'Brake Pads': ['Physical Measurement', 2, 'pieces', 'BRP'],
            'Brake Fluid': ['Liquid Measurement', 400, 'mL', 'BRF'],
        }

        usernames = ['jerrysantos', 'martingarcia', 'waynemambugan', 'emmantolentino', 'noelpampango',
                     'carlsinang', 'choloagila', 'roelbautista', 'jonathanlakbayin', 'joserodrigo',
                     'benignosalo']

        liquid_measurement = [500, 450, 300, 250]
        measurement_unit = ["mL", 'L', 'fl. oz']

        degree = ['Minor', 'Intermediate', 'Major']

        #  Shuttle 1
        shuttle_1_repair_1 = Repair(shuttle=Shuttle.objects.get(shuttle_number=1),
                                    driver_requested=Driver.objects.get(user=User.objects.get(username="jerrysantos")),
                                    date_requested=datetime.strptime('01032019', "%d%m%Y").date(),
                                    start_date=datetime.strptime('01032019', "%d%m%Y").date(),
                                    end_date=datetime.strptime('01032019', "%d%m%Y").date(),
                                    degree="Minor",
                                    status="C")
        shuttle_1_repair_1.save()

        shuttle_1_repair_1_problem_1 = RepairProblem(description="I hear screeching when I step on the brakes.")
        shuttle_1_repair_1_problem_1.save()
        shuttle_1_repair_1.problems.add(shuttle_1_repair_1_problem_1)

        shuttle_1_repair_1_purchase_order = PurchaseOrder(po_number=4, vendor=Vendor.objects.get(name="Ace Hardware"),
                                                          order_date=datetime.strptime('01022019', "%d%m%Y").date(),
                                                          completion_date=datetime.strptime('04022019',
                                                                                            "%d%m%Y").date(),
                                                          status="Complete")
        shuttle_1_repair_1_purchase_order.save()
        shuttle_1_repair_1_purchase_order_item_1 = PurchaseOrderItem(quantity=2,
                                                                     description="Pair of brake pads for "
                                                                                 "Mitsubishi L300",
                                                                     unit_price=750,
                                                                     category=ItemCategory.objects.get(category="Brake "
                                                                                                                "Pads"),
                                                                     item_type="Physical Measurement", measurement=2,
                                                                     unit="pieces",
                                                                     brand="Hi Q",
                                                                     delivery_date=datetime.strptime('04022019',
                                                                                                     "%d%m%Y").date(),
                                                                     received=True)
        shuttle_1_repair_1_purchase_order_item_1.save()
        shuttle_1_repair_1_purchase_order.po_items.add(shuttle_1_repair_1_purchase_order_item_1)
        shuttle_1_repair_1_item_1 = Item(category=ItemCategory.objects.get(category="Brake Pads"),
                                         description="Pair of brake pads for Mitsubishi L300",
                                         quantity=0, brand="Hi Q", unit_price=750, item_type="Physical Measurement",
                                         measurement=2, unit="pieces", vendor=Vendor.objects.get(name="Ace Hardware"),
                                         current_measurement=0, item_code="BRP002",
                                         delivery_date=datetime.strptime('04022019',
                                                                         "%d%m%Y").date(),
                                         purchase_order=shuttle_1_repair_1_purchase_order)
        shuttle_1_repair_1_item_1.save()
        shuttle_1_repair_1_item_1_movement = ItemMovement(item=shuttle_1_repair_1_item_1,
                                                          type="B",
                                                          quantity=2,
                                                          unit_price=750,
                                                          created=datetime.strptime('04022019',
                                                                                    "%d%m%Y").date())
        shuttle_1_repair_1_item_1_movement.save()
        shuttle_1_repair_1_finding_1 = RepairFinding(description="The brake pads are smooth",
                                                     item_defect=ItemCategory.objects.get(category="Brake Pads"))
        shuttle_1_repair_1_finding_1.save()
        shuttle_1_repair_1.findings.add(shuttle_1_repair_1_finding_1)

        shuttle_1_repair_1_modification_1 = RepairModifications(item_used=shuttle_1_repair_1_item_1,
                                                                quantity=2)
        shuttle_1_repair_1_modification_1.save()
        shuttle_1_repair_1.modifications.add(shuttle_1_repair_1_modification_1)
        shuttle_1_repair_1.save()

        shuttle_1_repair_1_item_1_movement_1 = ItemMovement(item=shuttle_1_repair_1_item_1,
                                                            type="G", created=datetime.strptime('04022019',
                                                                                    "%d%m%Y").date(),
                                                            quantity=2, repair=shuttle_1_repair_1)
        shuttle_1_repair_1_item_1_movement_1.save()

        for shuttle in Shuttle.objects.all():
            print(shuttle.shuttle_number)
            print(usernames[shuttle.shuttle_number - 1])
            for i in range(0, randint(3, 5)):
                start_date = datetime(2019, randint(1, 2), randint(1, 28)).date()
                end_date = datetime(2019, randint(1, 2), randint(1, 28)).date()
                while end_date < start_date:
                    end_date = datetime(2019, randint(1, 2), randint(1, 28)).date()
                vendor = random.choice(vendors)
                quantity_movement = randint(1, 5)
                broken_category = random.choice(categories)
                item_description = random.choice(descriptions[broken_category])
                item_price = randint(200, 800)
                item_brand = random.choice(brand[broken_category])
                finding = random.choice(findings[broken_category])
                problem = random.choice(problems[broken_category])
                item_details = item_types[broken_category]
                repair = Repair(shuttle=shuttle,
                                driver_requested=Driver.objects.get(
                                    user=User.objects.get(username=usernames[shuttle.shuttle_number - 1])),
                                date_requested=start_date,
                                start_date=start_date,
                                end_date=end_date,
                                degree=degree[randint(0, 2)],
                                status='C')
                repair.save()
                repair_problem = RepairProblem(description=problem)
                repair_problem.save()
                repair.problems.add(repair_problem)

                purchase_order = PurchaseOrder(po_number=PurchaseOrder.objects.count() + 1,
                                               vendor=Vendor.objects.get(name=vendor),
                                               order_date=start_date,
                                               completion_date=start_date, status="Complete")
                purchase_order.save()
                purchase_order_item = PurchaseOrderItem(quantity=quantity_movement,
                                                        description=item_description,
                                                        unit_price=item_price,
                                                        category=ItemCategory.objects.get(category=broken_category),
                                                        item_type=item_details[0],
                                                        measurement=item_details[1],
                                                        unit=item_details[2],
                                                        brand=item_brand,
                                                        delivery_date=start_date,
                                                        received=True)
                purchase_order_item.save()
                purchase_order.po_items.add(purchase_order_item)
                item = Item(category=ItemCategory.objects.get(category=broken_category),
                            description=item_description,
                            quantity=0, brand=item_brand, unit_price=item_price,
                            item_type=item_details[0], vendor=Vendor.objects.get(name=vendor),
                            measurement=item_details[1], unit=item_details[2],
                            item_code=(item_details[3] + str(randint(100, 999))),
                            delivery_date=start_date, purchase_order=purchase_order)
                item.save()
                item_movement = ItemMovement(item=item, type="B", quantity=quantity_movement, unit_price=item_price,
                                             created=start_date)
                item_movement.save()
                repair_finding = RepairFinding(description=finding,
                                               item_defect=ItemCategory.objects.get(category=broken_category))
                repair_finding.save()
                repair.findings.add(repair_finding)
                if item_details[0] == "Liquid Measurement":
                    repair_modification = RepairModifications(item_used=item, quantity=item_details[1])
                else:
                    repair_modification = RepairModifications(item_used=item, quantity=quantity_movement)
                repair_modification.save()
                repair.modifications.add(repair_modification)
                repair.save()

                item_movement_2 = ItemMovement(item=item, type="G", quantity=quantity_movement, repair=repair,
                                               created=start_date)
                item_movement_2.save()
