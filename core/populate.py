from datetime import timedelta
from datetime import datetime
from remittances.models import *
from members.models import *
from inventory.models import *
import random

vendors = ["Ace Hardware", "Handyman", "Budjolex", "Laguna Equipment"]

vendor_items = {
    'Ace Hardware': ['Oil', 'Windshield Wiper', 'Light Bulb'],
    'Handyman': ["Oil", 'Brake Pads', 'Brake Fluid'],
    'Budjolex': ["Windshield Wiper", 'Brake Pads'],
    'Laguna Equipment': ["Light Bulb", 'Brake Fluid', 'Oil']
}

item_types = {
    'Oil': ['Liquid Measurement', 300, 'mL', 'OIL'],
    'Tire': ['Single Item', None, None, 'TIR'],
    'Windshield Wiper': ['Physical Measurement', 2, 'pieces', 'WWR'],
    'Light Bulb': ['Single Item', None, None, 'LBB'],
    'Brake Pads': ['Physical Measurement', 2, 'pieces', 'BRP'],
    'Brake Fluid': ['Liquid Measurement', 400, 'mL', 'BRF'],
}

brand = {
    'Oil': ['NOW21', 'X-1R', 'MD10'],
    'Windshield Wiper': ['Banana Blade', 'Black horse', 'Universal'],
    'Light Bulb': ['Eso goal', 'Coromose', 'H4'],
    'Brake Pads': ['Bendix', 'OEM', 'Hi Q'],
    'Brake Fluid': ['Dynatext', 'Rock Oil', 'Gas Treatment']
}

categories = ['Oil', 'Windshield Wiper', 'Light Bulb', 'Brake Pads', 'Brake Fluid']

weighted_shuttle_average = [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 9]

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

usernames = ['jerrysantos', 'martingarcia', 'waynemambugan', 'emmantolentino', 'noelpampango',
             'carlsinang', 'choloagila', 'roelbautista', 'jonathanlakbayin', 'joserodrigo',
             'benignosalo']

findings = {
    'Oil': ['Low oil', 'Faulty Oil'],
    'Windshield Wiper': ["Old stock", 'Blade is broken'],
    'Light Bulb': ['Ran out of power', 'It broke'],
    'Brake Pads': ['Brake pads are smooth', 'The brake pad is cracked'],
    'Brake Fluid': ['Low fluid', 'Very viscous']
}

problems = {
    'Oil': ['Not running well', 'Making noises'],
    'Windshield Wiper': ['Making noise when wiping', 'Residue when wiping'],
    'Light Bulb': ['Flickering', 'No light'],
    'Brake Pads': ['Noise when braking', 'Not braking well'],
    'Brake Fluid': ['Noise when braking', 'Not braking well']
}

degree = ['Minor', 'Intermediate', 'Major']


class PopulateDatabase:
    @staticmethod
    def populate_inventory():
        category_oil = ItemCategory(category='Oil', code_prefix='OIL', quantity=0, minimum_quantity=2)
        category_oil.save()
        category_windshield = ItemCategory(category='Windshield Wiper', code_prefix='WWR', quantity=0,
                                           minimum_quantity=4)
        category_windshield.save()
        category_light_bulb = ItemCategory(category="Light Bulb", code_prefix='LBB', quantity=0, minimum_quantity=4)
        category_light_bulb.save()
        category_brake_pad = ItemCategory(category="Brake Pads", code_prefix='BRP', quantity=0, minimum_quantity=4)
        category_brake_pad.save()
        category_brake_fluid = ItemCategory(category="Brake Fluid", code_prefix='BRF', quantity=0, minimum_quantity=2)
        category_brake_fluid.save()
        vendor = Vendor(name="Ace Hardware", address="12 Karilagan St., Pasig City", contact_number="09178712380")
        vendor.save()
        vendor_item_1 = VendorItem(vendor=vendor, category=ItemCategory.objects.get(category="Oil"))
        vendor_item_1.save()
        vendor_item_1 = VendorItem(vendor=vendor, category=ItemCategory.objects.get(category="Windshield Wiper"))
        vendor_item_1.save()
        vendor_item_1 = VendorItem(vendor=vendor, category=ItemCategory.objects.get(category="Light Bulb"))
        vendor_item_1.save()
        vendor2 = Vendor(name="Handyman", address="5th Floor Megamall, Ortigas Avenue", contact_number="09266323535")
        vendor2.save()
        vendor_item_1 = VendorItem(vendor=vendor2, category=ItemCategory.objects.get(category="Oil"))
        vendor_item_1.save()
        vendor_item_1 = VendorItem(vendor=vendor2, category=ItemCategory.objects.get(category="Brake Pads"))
        vendor_item_1.save()
        vendor_item_1 = VendorItem(vendor=vendor2, category=ItemCategory.objects.get(category="Brake Fluid"))
        vendor_item_1.save()
        vendor3 = Vendor(name="Budjolex", address="427 Bel-air, Sta. Rosa City, Laguna", contact_number="09153552690")
        vendor3.save()
        vendor_item_1 = VendorItem(vendor=vendor3, category=ItemCategory.objects.get(category="Windshield Wiper"))
        vendor_item_1.save()
        vendor_item_1 = VendorItem(vendor=vendor3, category=ItemCategory.objects.get(category="Brake Pads"))
        vendor_item_1.save()
        vendor4 = Vendor(name="Laguna Equipment", address="759 Saturn St., Sta. Rosa City, Laguna",
                         contact_number="09173512562")
        vendor4.save()
        vendor_item_1 = VendorItem(vendor=vendor4, category=ItemCategory.objects.get(category="Light Bulb"))
        vendor_item_1.save()
        vendor_item_1 = VendorItem(vendor=vendor4, category=ItemCategory.objects.get(category="Oil"))
        vendor_item_1.save()
        vendor_item_1 = VendorItem(vendor=vendor4, category=ItemCategory.objects.get(category="Brake Fluid"))
        vendor_item_1.save()

        for i in range(1, 300):
            start_date_year = randint(2017, 2019)
            if start_date_year == 2019:
                start_date_month = randint(1, 3)
            else:
                start_date_month = randint(1, 12)

            start_date = datetime(start_date_year, start_date_month, randint(1, 28)).date()
            end_date = datetime(start_date_year, start_date_month, randint(1, 28)).date()
            while end_date <= start_date:
                start_date = datetime(start_date_year, start_date_month, randint(1, 28)).date()
                end_date = datetime(start_date_year, start_date_month, randint(1, 28)).date()

            is_late = randint(1, 5)
            if is_late == 3:
                expected_delivery = end_date - timedelta(days=1)
            else:
                expected_delivery = end_date
            vendor = Vendor.objects.order_by("?").first()
            purchase_order = PurchaseOrder(po_number=i, vendor=vendor, order_date=start_date, completion_date=end_date,
                                           status="Complete", expected_delivery=expected_delivery)
            purchase_order.save()

            shuttle = Shuttle.objects.get(shuttle_number=random.choice(weighted_shuttle_average))
            print(shuttle.id)

            degree_of_repair = degree[randint(0, 2)]
            if degree_of_repair == "Major":
                labor = randint(2500, 5000)
            else:
                labor = None
            repair = Repair(shuttle=shuttle,
                            driver_requested=Driver.objects.get(
                                user=User.objects.get(username=usernames[shuttle.shuttle_number - 1])),
                            date_requested=start_date,
                            end_date=end_date,
                            degree=degree_of_repair,
                            status='C',
                            labor_fee=labor)
            repair.save()

            for q in range(1, 4):
                quantity = randint(1, 3)
                category = random.choice(vendor_items[vendor.name])
                item_description = random.choice(descriptions[category])
                item_brand = random.choice(brand[category])
                item_price = randint(200, 800)
                item_details = item_types[category]
                category = ItemCategory.objects.get(category=category)
                category.save()
                po_item = PurchaseOrderItem(quantity=quantity,
                                            description=item_description,
                                            unit_price=item_price,
                                            category=category,
                                            item_type=item_details[0],
                                            measurement=item_details[1],
                                            unit=item_details[2],
                                            brand=item_brand, delivery_date=start_date,
                                            received=True, status='Delivered')
                po_item.save()
                purchase_order.po_items.add(po_item)
                defective = randint(1, 6)
                if defective == 3:
                    vendor_performance = VendorPerformance(vendor=vendor,
                                                           item_category=category,
                                                           purchase_order=purchase_order,
                                                           expected_delivery=expected_delivery,
                                                           actual_delivery=end_date, defective=True)
                    vendor_performance.save()
                else:
                    vendor_performance = VendorPerformance(vendor=vendor,
                                                           item_category=category,
                                                           purchase_order=purchase_order,
                                                           expected_delivery=expected_delivery,
                                                           actual_delivery=end_date, defective=False)
                    vendor_performance.save()
                item = Item(category=category,
                            description=item_description,
                            quantity=0, brand=item_brand, unit_price=item_price,
                            item_type=item_details[0],
                            measurement=item_details[1], vendor=vendor,
                            unit=item_details[2], item_code=(item_details[3] + str(randint(50, 999))),
                            delivery_date=end_date, purchase_order=purchase_order)
                item.save()
                item_movement = ItemMovement(item=item, type="B", quantity=quantity, unit_price=item_price,
                                             created=end_date)
                item_movement.save()

                repair_problem = RepairProblem(description=random.choice(problems[category.category]))
                repair_problem.save()
                repair.problems.add(repair_problem)

                repair_finding = RepairFinding(description=random.choice(findings[category.category]),
                                               item_defect=category)
                repair_finding.save()
                repair.findings.add(repair_finding)
                if item_details[0] == "Liquid Measurement":
                    repair_modification = RepairModifications(item_used=item, quantity=item_details[1])
                else:
                    repair_modification = RepairModifications(item_used=item, quantity=quantity)
                repair_modification.save()
                repair.modifications.add(repair_modification)
                item_movement_2 = ItemMovement(item=item, type="G", quantity=quantity, repair=repair,
                                               created=end_date)
                item_movement_2.save()
            repair.save()

        start_date = datetime.strptime('25032019', "%d%m%Y").date()
        end_date = datetime.strptime('28032019', "%d%m%Y").date()
        # Oil, Windshield Wiper, Lightbulb, Ace hardware
        purchase_order_1 = PurchaseOrder(po_number=301, vendor=Vendor.objects.get(name="Ace Hardware"),
                                         order_date=start_date, completion_date=end_date,
                                         status='Complete', expected_delivery=end_date)
        purchase_order_1.save()

        # Oil
        po_item_1 = PurchaseOrderItem(quantity=2, description="Oil for L300", unit_price=250,
                                      category=ItemCategory.objects.get(category="Oil"),
                                      item_type=item_types['Oil'][0],
                                      measurement=item_types['Oil'][1],
                                      unit=item_types['Oil'][2],
                                      brand="WD-40",
                                      received=True, status='Delivered')
        po_item_1.save()
        purchase_order_1.po_items.add(po_item_1)
        vendor_performance_1 = VendorPerformance(vendor=Vendor.objects.get(name="Ace Hardware"),
                                                 item_category=ItemCategory.objects.get(category='Oil'),
                                                 purchase_order=purchase_order_1, expected_delivery=end_date,
                                                 actual_delivery=end_date, defective=False)
        vendor_performance_1.save()

        item_1 = Item(category=ItemCategory.objects.get(category="Oil"),
                      description=descriptions["Oil"][0],
                      brand="WD-40", quantity=2, unit_price=250, item_type=item_types['Oil'][0],
                      measurement=item_types['Oil'][1], vendor=Vendor.objects.get(name="Ace Hardware"),
                      unit=item_types['Oil'][2], item_code="OIL857", delivery_date=end_date,
                      purchase_order=purchase_order_1)
        item_1.save()
        item_movement = ItemMovement(item=item_1, type="B", quantity=2, unit_price=250, created=end_date)
        item_movement.save()
        category = ItemCategory.objects.get(category="Oil")
        category.quantity = 2
        category.save()

        # Windshield Wiper
        ace_hardware = Vendor.objects.get(name="Ace Hardware")
        category = ItemCategory.objects.get(category="Windshield Wiper")

        po_item_2 = PurchaseOrderItem(quantity=2, description="Windshield wiper for L300",
                                      unit_price=300,
                                      category=category,
                                      item_type=item_types['Windshield Wiper'][0],
                                      measurement=2, unit="pieces",
                                      brand=brand['Windshield Wiper'][0],
                                      received=True, status='Delivered')
        po_item_2.save()
        purchase_order_1.po_items.add(po_item_2)
        vendor_performance_2 = VendorPerformance(vendor=ace_hardware,
                                                 item_category=category,
                                                 purchase_order=purchase_order_1,
                                                 expected_delivery=end_date,
                                                 actual_delivery=end_date,
                                                 defective=False)
        vendor_performance_2.save()

        item_2 = Item(category=category,
                      description=descriptions['Windshield Wiper'][0],
                      brand=brand['Windshield Wiper'][0],
                      quantity=2,
                      unit_price=300,
                      item_type=['Windshield Wiper'][0],
                      measurement=2,
                      vendor=ace_hardware,
                      unit='pieces',
                      item_code="WWR328",
                      delivery_date=end_date,
                      purchase_order=purchase_order_1)
        item_2.save()
        item_movement_2 = ItemMovement(item=item_2, type="B", quantity=2, unit_price=300, created=end_date)
        item_movement_2.save()
        category.quantity = 4
        category.save()

        # Lightbulb
        lightbulb = ItemCategory.objects.get(category="Light Bulb")

        po_item_3 = PurchaseOrderItem(quantity=2, description=descriptions['Light Bulb'][0],
                                      unit_price=200, category=lightbulb, item_type=item_types['Light Bulb'][0],
                                      measurement=2, unit='pieces', brand=brand['Light Bulb'][0],
                                      received=True, status='Delivered')
        po_item_3.save()
        purchase_order_1.po_items.add(po_item_3)
        vendor_performance_3 = VendorPerformance(vendor=ace_hardware,
                                                 item_category=lightbulb,
                                                 purchase_order=purchase_order_1,
                                                 expected_delivery=end_date,
                                                 actual_delivery=end_date,
                                                 defective=False)
        vendor_performance_3.save()

        item_3 = Item(category=lightbulb,
                      description=descriptions['Light Bulb'][0],
                      brand=brand['Light Bulb'][0],
                      quantity=2,
                      unit_price=200,
                      item_type=['Light Bulb'][0],
                      measurement=2,
                      vendor=ace_hardware,
                      unit='pieces',
                      item_code='LBB631',
                      delivery_date=end_date,
                      purchase_order=purchase_order_1)
        item_3.save()
        item_movement_3 = ItemMovement(item=item_3, type='B', quantity=2, unit_price=200, created=end_date)
        item_movement_3.save()
        lightbulb.quantity = 4
        lightbulb.save()

        # Brake pads, brake fluids, Handyman
        handyman = Vendor.objects.get(name="Handyman")
        purchase_order_2 = PurchaseOrder(po_number=302, vendor=handyman, order_date=start_date,
                                         completion_date=end_date, status='Complete', expected_delivery=end_date)
        purchase_order_2.save()

        # Brake Pads
        brake_pads = ItemCategory.objects.get(category='Brake Pads')
        po_item_4 = PurchaseOrderItem(quantity=2, description=descriptions['Brake Pads'][0], unit_price=700,
                                      category=brake_pads, item_type=item_types['Brake Pads'][0],
                                      measurement=2, unit='pieces',
                                      brand=brand['Brake Pads'][0],
                                      received=True, status='Delivered')
        po_item_4.save()
        purchase_order_2.po_items.add(po_item_4)
        vendor_performance_4 = VendorPerformance(vendor=handyman,
                                                 item_category=brake_pads,
                                                 purchase_order=purchase_order_2,
                                                 expected_delivery=end_date,
                                                 actual_delivery=end_date,
                                                 defective=False)
        vendor_performance_4.save()
        item_4 = Item(category=brake_pads,
                      description=descriptions['Brake Pads'][0],
                      brand=brand['Brake Pads'][0],
                      quantity=2,
                      unit_price=700,
                      item_type=['Brake Pads'][0],
                      measurement=2,
                      vendor=handyman,
                      unit='pieces',
                      item_code="BRP943",
                      delivery_date=end_date,
                      purchase_order=purchase_order_2)
        item_4.save()
        item_movement_4 = ItemMovement(item=item_4, type='B', quantity=2, unit_price=700, created=end_date)
        item_movement_4.save()
        brake_pads.quantity = 4
        brake_pads.save()

        # Brake Fluids
        brake_fluids = ItemCategory.objects.get(category="Brake Fluid")

        po_item_5 = PurchaseOrderItem(quantity=2, description=descriptions['Brake Fluid'][0],
                                      unit_price=300,
                                      category=brake_fluids, item_type=item_types['Brake Fluid'][0],
                                      measurement=item_types['Brake Fluid'][1],
                                      unit=item_types['Brake Fluid'][2],
                                      brand=brand['Brake Fluid'][0],
                                      received=True, status='Delivered')
        po_item_5.save()
        purchase_order_2.po_items.add(po_item_5)
        vendor_performance_5 = VendorPerformance(vendor=handyman,
                                                 item_category=brake_fluids,
                                                 purchase_order=purchase_order_2,
                                                 expected_delivery=end_date,
                                                 actual_delivery=end_date,
                                                 defective=False)
        vendor_performance_5.save()

        item_5 = Item(category=brake_fluids,
                      description=descriptions['Brake Fluid'][0],
                      brand=brand['Brake Fluid'][0],
                      quantity=2,
                      unit_price=300,
                      item_type=item_types['Brake Fluid'][0],
                      measurement=item_types['Brake Fluid'][1],
                      vendor=handyman,
                      unit=item_types['Brake Fluid'][2],
                      item_code='BRF285', delivery_date=end_date,
                      purchase_order=purchase_order_2)
        item_5.save()
        item_movement_5 = ItemMovement(item=item_5, type='B', quantity=2, unit_price=300, created=end_date)
        item_movement_5.save()
        brake_fluids.quantity = 2
        brake_fluids.save()

        # purchase_order_1 = PurchaseOrder(po_number=1, vendor=vendor,
        #                                  order_date=datetime.strptime('27122018', "%d%m%Y").date(),
        #                                  completion_date=datetime.strptime('01012019', "%d%m%Y").date(),
        #                                  status="Complete")
        # purchase_order_1.save()
        # purchase_order_1_item_1 = PurchaseOrderItem(quantity=4, description="Windshield wiper for Toyota L300",
        #                                             unit_price=200, category=category_windshield,
        #                                             item_type="Physical Measurement", measurement=2, unit="pieces",
        #                                             brand="Vew Clear",
        #                                             delivery_date=datetime.strptime('01012019', "%d%m%Y").date(),
        #                                             received=True)
        # purchase_order_1_item_1.save()
        # purchase_order_1.po_items.add(purchase_order_1_item_1)
        # item = Item(category=category_windshield,
        #             description="Windshield wiper for Toyota L300",
        #             quantity=4,
        #             purchase_order=purchase_order_1,
        #             brand="Vew Clear",
        #             unit_price=200,
        #             item_type="Physical Measurement",
        #             measurement=2, unit="pieces", vendor=vendor, current_measurement=2,
        #             item_code="WWR001", delivery_date=datetime.strptime('01012019', "%d%m%Y").date())
        # item.save()
        # item_movement = ItemMovement(item=item,
        #                              type="B",
        #                              quantity=6,
        #                              unit_price=150,
        #                              created=datetime.strptime(
        #                                  '01112018', "%d%m%Y").date())
        # item_movement.save()
        #
        # category_windshield.quantity = 8
        # category_windshield.save()
        #
        # item2 = Item(category=category_light_bulb,
        #              description="Can be used for brake light or turn signal lights",
        #              quantity=8,
        #              purchase_order=purchase_order_1,
        #              brand="TTW",
        #              vendor=vendor,
        #              unit_price=250, item_type="Single Item", item_code="LBB001",
        #              delivery_date=datetime.strptime('01012019', "%d%m%Y").date())
        # item2.save()
        # item_movement_2 = ItemMovement(item=item2,
        #                                type="B",
        #                                quantity=10,
        #                                unit_price=250,
        #                                created=datetime.strptime(
        #                                    '02112018', "%d%m%Y").date())
        # item_movement_2.save()
        # category_light_bulb.quantity = 8
        # category_light_bulb.save()
        #
        # purchase_order_1_item_2 = PurchaseOrderItem(quantity=8,
        #                                             description="Can be used for brake light or turn signal lights",
        #                                             unit_price=250, category=category_light_bulb,
        #                                             item_type="Physical Measurement", measurement=10, unit="pieces",
        #                                             brand="TTW",
        #                                             delivery_date=datetime.strptime('01012019', "%d%m%Y").date(),
        #                                             received=True)
        # purchase_order_1_item_2.save()
        # purchase_order_1.po_items.add(purchase_order_1_item_2)
        # purchase_order_2 = PurchaseOrder(po_number=2, vendor=vendor2,
        #                                  order_date=datetime.strptime('14022019', "%d%m%Y").date(),
        #                                  completion_date=datetime.strptime('17022019', "%d%m%Y").date(),
        #                                  status="Complete")
        # purchase_order_2.save()
        #
        # purchase_order_2_item_3 = PurchaseOrderItem(quantity=2, description="Pair of brake pads for Mitsubishi L300",
        #                                             unit_price=800, category=category_brake_pad,
        #                                             item_type="Physical Measurement", measurement=2, unit="pieces",
        #                                             brand="Akebono",
        #                                             delivery_date=datetime.strptime('17022019', "%d%m%Y").date(),
        #                                             received=True)
        # purchase_order_2_item_3.save()
        # purchase_order_2.po_items.add(purchase_order_2_item_3)
        # item3 = Item(category=category_brake_pad,
        #              description="Pair of brake pads for Mitsubishi L300",
        #              quantity=2,
        #              purchase_order=purchase_order_2,
        #              brand="Akebono",
        #              vendor=vendor2,
        #              item_code="BRP001",
        #              unit_price=900,
        #              item_type="Physical Measurement", current_measurement=2,
        #              delivery_date=datetime.strptime('17022019', "%d%m%Y").date(),
        #              measurement=2, unit="Pieces")
        # item3.save()
        #
        # item_movement3 = ItemMovement(item=item3,
        #                               type="B",
        #                               quantity=5,
        #                               unit_price=1300,
        #                               created=datetime.strptime(
        #                                   '17022019', "%d%m%Y").date())
        # item_movement3.save()
        #
        # purchase_order_2_item_4 = PurchaseOrderItem(quantity=5, description="Synthetic Performance Gasoline Oil",
        #                                             unit_price=455, category=category_oil,
        #                                             item_type="Liquid Measurement", measurement=400, unit="mL",
        #                                             brand="Apex",
        #                                             delivery_date=datetime.strptime('17022019', "%d%m%Y").date(),
        #                                             received=True)
        #
        # purchase_order_2_item_4.save()
        # purchase_order_2.po_items.add(purchase_order_2_item_4)
        # category_brake_pad.quantity = 4
        # category_brake_pad.save()
        #
        # item4 = Item(category=category_oil,
        #              description="Synthetic Performance Gasoline Oil",
        #              quantity=5,
        #              purchase_order=purchase_order_2,
        #              brand="Apex",
        #              vendor=vendor2,
        #              unit_price=455,
        #              item_type="Liquid Measurement", current_measurement=400,
        #              measurement=400, unit="mL", item_code="OIL001",
        #              delivery_date=datetime.strptime('17022019', "%d%m%Y").date())
        # item4.save()
        # category_oil.quantity = 5
        # category_oil.save()
        # item_movement4 = ItemMovement(item=item4,
        #                               type="B",
        #                               quantity=5,
        #                               unit_price=455,
        #                               created=datetime.strptime(
        #                                   '17022019', "%d%m%Y").date())
        # item_movement4.save()
        #
        # purchase_order_3 = PurchaseOrder(po_number=3, vendor=vendor4,
        #                                  order_date=datetime.strptime('05032019', "%d%m%Y").date(),
        #                                  completion_date=datetime.strptime('07032019', "%d%m%Y").date(),
        #                                  status="Complete")
        # purchase_order_3.save()
        # purchase_order_3_item_1 = PurchaseOrderItem(quantity=5,
        #                                             description="Radial Tires",
        #                                             unit_price=2500,
        #                                             category=category_tire,
        #                                             item_type="Single Item",
        #                                             measurement=None,
        #                                             unit=None,
        #                                             brand="Goodyear",
        #                                             delivery_date=datetime.strptime('06032019', "%d%m%Y").date(),
        #                                             received=True)
        # purchase_order_3_item_1.save()
        # purchase_order_3.po_items.add(purchase_order_3_item_1)
        #
        # item_tire = Item(description="Radial Tires",
        #                  quantity=5,
        #                  category=category_tire,
        #                  unit_price=2500,
        #                  item_type="Single Item",
        #                  measurement=None,
        #                  unit=None,
        #                  brand="Goodyear",
        #                  vendor=vendor4,
        #                  delivery_date=datetime.strptime('06032019', "%d%m%Y"),
        #                  item_code='TIR001',
        #                  current_measurement=5,
        #                  purchase_order=purchase_order_3)
        # item_tire.save()
        # item_tire_movement = ItemMovement(item=item_tire,
        #                                   type="B",
        #                                   quantity=5,
        #                                   unit_price=2500,
        #                                   created=datetime.strptime('06032019', "%d%m%Y"))
        # item_tire_movement.save()
        # category_tire.quantity = 5
        # category_tire.save()
        #
        # purchase_order_3_item_2 = PurchaseOrderItem(quantity=6,
        #                                             description="Super Heavy duty brake and clutch fluid",
        #                                             unit_price=250,
        #                                             category=category_brake_fluid,
        #                                             item_type="Liquid Measurement",
        #                                             measurement=500,
        #                                             unit="mL",
        #                                             brand="Prestone",
        #                                             delivery_date=datetime.strptime('07032019', "%d%m%Y").date(),
        #                                             received=True)
        # purchase_order_3_item_2.save()
        # purchase_order_3.po_items.add(purchase_order_3_item_2)
        # item_brake_fluid = Item(description="Super Heavy duty brake and clutch fluid",
        #                         quantity=6,
        #                         category=category_brake_fluid,
        #                         unit_price=250,
        #                         item_type="Liquid Measurement",
        #                         measurement=500,
        #                         unit="mL",
        #                         brand="Prestone",
        #                         vendor=vendor4,
        #                         item_code="BRF001",
        #                         delivery_date=datetime.strptime('07032019', "%d%m%Y"),
        #                         current_measurement=500,
        #                         purchase_order=purchase_order_3)
        # item_brake_fluid.save()
        #
        # item_brake_fluid_movement = ItemMovement(item=item_brake_fluid,
        #                                          type="B",
        #                                          quantity=6,
        #                                          unit_price=250,
        #                                          created=datetime.strptime('07032019', "%d%m%Y"))
        # item_brake_fluid_movement.save()
        # category_brake_fluid.quantity = 6
        # category_brake_fluid.save()

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

        liquid_measurement = [500, 450, 300, 250]
        measurement_unit = ["mL", 'L', 'fl. oz']

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
