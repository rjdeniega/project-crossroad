import random

from members.models import *
from datetime import datetime, timedelta
from remittances.models import *


class PopulateMembers:
    @staticmethod
    def populate_members():
        user1 = User.objects.create(
            username="member",
            password="admin1234"
        )
        user2 = User.objects.create(
            username="member2",
            password="admin1234"
        )
        user3 = User.objects.create(
            username="member3",
            password="admin1234"
        )
        user4 = User.objects.create(
            username="member4",
            password="admin1234"
        )
        Member.objects.create(user=user1,
                              tin_number=11435,
                              accepted_date='2011-10-19',
                              civil_status='S',
                              educational_attainment='V',
                              occupation='Engineer',
                              no_of_dependents=5,
                              religion='Catholic',
                              contact_no='01234',
                              annual_income=500000,
                              termination_date=None,
                              name='Lissa Magpantay',
                              email='asd@gmail.com',
                              address='Laguna',
                              birth_date='2010-9-06',
                              sex='F'
                              )
        Member.objects.create(user=user2,
                              tin_number=11436,
                              accepted_date='2011-10-19',
                              civil_status='S',
                              educational_attainment='V',
                              occupation='Engineer',
                              no_of_dependents=5,
                              religion='Catholic',
                              contact_no='01234',
                              annual_income=500000,
                              termination_date=None,
                              name='Erwin Heusaff',
                              email='asd@gmail.com',
                              address='Laguna',
                              birth_date='2010-9-06',
                              sex='F'
                              )
        Member.objects.create(user=user3,
                              tin_number=11437,
                              accepted_date='2011-10-19',
                              civil_status='S',
                              educational_attainment='V',
                              occupation='Engineer',
                              no_of_dependents=5,
                              religion='Catholic',
                              contact_no='01234',
                              annual_income=500000,
                              termination_date=None,
                              name='Angel Aquino',
                              email='asd@gmail.com',
                              address='Laguna',
                              birth_date='2010-9-06',
                              sex='F'
                              )
        Member.objects.create(user=user4,
                              tin_number=11438,
                              accepted_date='2011-10-19',
                              civil_status='S',
                              educational_attainment='V',
                              occupation='Engineer',
                              no_of_dependents=5,
                              religion='Catholic',
                              contact_no='01234',
                              annual_income=500000,
                              termination_date=None,
                              name='Paolo Manlapaz',
                              email='asd@gmail.com',
                              address='Laguna',
                              birth_date='2010-9-06',
                              sex='M'
                              )

    @staticmethod
    def add_ID_cards():
        x = 1000
        for member in Member.objects.all():
            if member.pk % 2 == 0:
                x += 1
                IDCards.objects.create(member=member, can=x, register_date=datetime.now())

    @staticmethod
    def add_member_shares():
        for member in Member.objects.all():
            current_date = datetime.now() - timedelta(days=15)
            new_end_date = current_date + timedelta(days=7)

            while current_date <= new_end_date:
                Share.objects.create(
                    member=member,
                    value=random.randint(1, 7),
                    date_of_update=current_date,
                    receipt="OR150",
                )
                current_date += timedelta(days=1)

    @staticmethod
    def add_member_transactions(current_date, new_end_date):

        while current_date <= new_end_date:
            for member in Member.objects.all():
                x = randint(0, 1)
                if x == 1:
                    CarwashTransaction.objects.create(date=current_date, member=member,
                                                      receipt="OR123" + str(random.randint(1, 10)),
                                                      total=random.randint(200, 700))

            current_date += timedelta(days=1)

    @staticmethod
    def random_with_n_digits(n):
        range_start = 10 ** (n - 1)
        range_end = (10 ** n) - 1
        return randint(range_start, range_end)

    @staticmethod
    def populate_beep(current_date, new_end_date):
        # current_date = datetime.now() - timedelta(days=7)
        # new_end_date = current_date + timedelta(days=14)
        values = [10.00, 13.00, 15.00]

        while current_date <= new_end_date:
            am_shift = BeepShift.objects.create(type='A', date=current_date)
            pm_shift = BeepShift.objects.create(type='P', date=current_date)

            # current date + random time between 8AM - 3PM
            am_today_random_time = current_date.replace(hour=randint(8, 14), minute=randint(0, 59))
            pm_today_random_time = current_date.replace(hour=randint(14, 23), minute=randint(0, 59))
            am_customers = randint(5, 31)
            pm_customers = randint(5, 31)
            for i in range(5, am_customers):
                BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=values[random.randint(0, 2)])
            for i in range(5, pm_customers):
                BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=pm_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=values[random.randint(0, 2)])

            current_date += timedelta(days=1)

    @staticmethod
    def new_populate_beep(current_date, new_end_date):
        # current_date = datetime.now() - timedelta(days=7)
        # new_end_date = current_date + timedelta(days=14)
        values = [10.00, 13.00, 15.00]

        # create starting point

        while current_date <= new_end_date:
            PopulateMembers.generate_beep(current_date)
            current_date += timedelta(days=1)

    @staticmethod
    def generate_first_objects(current_date):
        am_shift = BeepShift.objects.create(type='A', date=current_date)
        pm_shift = BeepShift.objects.create(type='P', date=current_date)
        values = [10.00, 13.00, 15.00]

        six_to_nine = [10, 11, 12]
        ten_to_one = [5, 6, 7]
        two_to_three = [5, 6, 7]
        four_to_six = [20, 21, 22]
        seven_to_twelve = [15, 16, 17]
        three_to_five = [2, 3, 4]
        add_random = [0, 0, 0, 1, 2, 3]

        for i in range(1, six_to_nine[randint(0, 2)]):
            am_today_random_time = current_date.replace(hour=randint(6, 9), minute=randint(0, 59))

            BeepTransaction.objects.create(shift=am_shift,
                                           card_number=PopulateMembers.random_with_n_digits(8),
                                           transaction_date_time=am_today_random_time,
                                           shuttle=Shuttle.objects.order_by("?").first(),
                                           total=15)

        for i in range(1, ten_to_one[randint(0, 2)]):
            am_today_random_time = current_date.replace(hour=randint(10, 13), minute=randint(0, 59))

            BeepTransaction.objects.create(shift=am_shift,
                                           card_number=PopulateMembers.random_with_n_digits(8),
                                           transaction_date_time=am_today_random_time,
                                           shuttle=Shuttle.objects.order_by("?").first(),
                                           total=10)
        for i in range(1, two_to_three[randint(0, 2)]):
            am_today_random_time = current_date.replace(hour=randint(14, 15), minute=randint(0, 59))

            BeepTransaction.objects.create(shift=pm_shift,
                                           card_number=PopulateMembers.random_with_n_digits(8),
                                           transaction_date_time=am_today_random_time,
                                           shuttle=Shuttle.objects.order_by("?").first(),
                                           total=12)
        for i in range(1, four_to_six[randint(0, 2)]):
            am_today_random_time = current_date.replace(hour=randint(16, 18), minute=randint(0, 59))

            BeepTransaction.objects.create(shift=pm_shift,
                                           card_number=PopulateMembers.random_with_n_digits(8),
                                           transaction_date_time=am_today_random_time,
                                           shuttle=Shuttle.objects.order_by("?").first(),
                                           total=15)
        hours = [19, 20, 21, 22, 23]
        for i in range(1, seven_to_twelve[randint(0, 2)]):
            am_today_random_time = current_date.replace(hour=hours[randint(0, 4)], minute=randint(0, 59))

            BeepTransaction.objects.create(shift=pm_shift,
                                           card_number=PopulateMembers.random_with_n_digits(8),
                                           transaction_date_time=am_today_random_time,
                                           shuttle=Shuttle.objects.order_by("?").first(),
                                           total=12)
        for i in range(1, three_to_five[randint(0, 2)]):
            am_today_random_time = current_date.replace(hour=randint(3, 5), minute=randint(0, 59))

            BeepTransaction.objects.create(shift=am_shift,
                                           card_number=PopulateMembers.random_with_n_digits(8),
                                           transaction_date_time=am_today_random_time,
                                           shuttle=Shuttle.objects.order_by("?").first(),
                                           total=12)

        print("Finished first objects")

    # @staticmethod
    # def generate_temporary(current_date):
    #     am_shift = BeepShift.objects.create(type='A', date=current_date)
    #     pm_shift = BeepShift.objects.create(type='P', date=current_date)
    #     values = [10.00, 13.00, 15.00]
    #
    #     six_to_nine = [0, 1, 2]
    #     ten_to_one = [2, 5, 6]
    #     two_to_three = [0, 3, 4]
    #     four_to_six = [10, 11, 12]
    #     seven_to_twelve = [12, 13, 14]
    #     three_to_five = [0, 1, 2]
    #     add_random = [0, 0, 0, 1, 2, 3]
    #
    #     for i in range(1, six_to_nine[randint(0, 2)]):
    #         am_today_random_time = current_date.replace(hour=randint(6, 9), minute=randint(0, 59))
    #
    #         BeepTransaction.objects.create(shift=am_shift,
    #                                        card_number=PopulateMembers.random_with_n_digits(8),
    #                                        transaction_date_time=am_today_random_time,
    #                                        shuttle=Shuttle.objects.order_by("?").first(),
    #                                        total=values[random.randint(0, 2)])
    #
    #     for i in range(1, ten_to_one[randint(0, 2)]):
    #         am_today_random_time = current_date.replace(hour=randint(10, 13), minute=randint(0, 59))
    #
    #         BeepTransaction.objects.create(shift=am_shift,
    #                                        card_number=PopulateMembers.random_with_n_digits(8),
    #                                        transaction_date_time=am_today_random_time,
    #                                        shuttle=Shuttle.objects.order_by("?").first(),
    #                                        total=values[random.randint(0, 2)])
    #     for i in range(1, two_to_three[randint(0, 2)]):
    #         am_today_random_time = current_date.replace(hour=randint(14, 15), minute=randint(0, 59))
    #
    #         BeepTransaction.objects.create(shift=pm_shift,
    #                                        card_number=PopulateMembers.random_with_n_digits(8),
    #                                        transaction_date_time=am_today_random_time,
    #                                        shuttle=Shuttle.objects.order_by("?").first(),
    #                                        total=values[random.randint(0, 2)])
    #     for i in range(1, four_to_six[randint(0, 2)]):
    #         am_today_random_time = current_date.replace(hour=randint(16, 18), minute=randint(0, 59))
    #
    #         BeepTransaction.objects.create(shift=pm_shift,
    #                                        card_number=PopulateMembers.random_with_n_digits(8),
    #                                        transaction_date_time=am_today_random_time,
    #                                        shuttle=Shuttle.objects.order_by("?").first(),
    #                                        total=values[random.randint(0, 2)])
    #     hours = [19, 20, 21, 22, 23]
    #     for i in range(1, seven_to_twelve[randint(0, 2)]):
    #         am_today_random_time = current_date.replace(hour=hours[randint(0, 4)], minute=randint(0, 59))
    #
    #         BeepTransaction.objects.create(shift=pm_shift,
    #                                        card_number=PopulateMembers.random_with_n_digits(8),
    #                                        transaction_date_time=am_today_random_time,
    #                                        shuttle=Shuttle.objects.order_by("?").first(),
    #                                        total=values[random.randint(0, 2)])
    #     for i in range(1, three_to_five[randint(0, 2)]):
    #         am_today_random_time = current_date.replace(hour=randint(3, 5), minute=randint(0, 59))
    #
    #         BeepTransaction.objects.create(shift=am_shift,
    #                                        card_number=PopulateMembers.random_with_n_digits(8),
    #                                        transaction_date_time=am_today_random_time,
    #                                        shuttle=Shuttle.objects.order_by("?").first(),
    #                                        total=values[random.randint(0, 2)])

    @staticmethod
    def generate_beep_per_hour(current_date):
        am_shift = BeepShift.objects.create(type='A', date=current_date)
        pm_shift = BeepShift.objects.create(type='P', date=current_date)
        values = [10.00, 13.00, 15.00]

        last_six_to_nine = len(
            BeepTransaction.objects.filter(transaction_date_time__date=(current_date - timedelta(days=1)),
                                           transaction_date_time__hour__gte=6, transaction_date_time__hour__lte=9))
        print(last_six_to_nine)
        last_ten_to_one = len(
            BeepTransaction.objects.filter(transaction_date_time__date=(current_date - timedelta(days=1)),
                                           transaction_date_time__hour__gte=10, transaction_date_time__hour__lte=13))
        last_two_to_three = len(
            BeepTransaction.objects.filter(transaction_date_time__date=(current_date - timedelta(days=1)),
                                           transaction_date_time__hour__gte=14, transaction_date_time__hour__lte=15))
        last_four_to_six = len(
            BeepTransaction.objects.filter(transaction_date_time__date=(current_date - timedelta(days=1)),
                                           transaction_date_time__hour__gte=16, transaction_date_time__hour__lte=18))
        last_seven_to_twelve = len(
            BeepTransaction.objects.filter(transaction_date_time__date=(current_date - timedelta(days=1)),
                                           transaction_date_time__hour__gte=19, transaction_date_time__hour__lte=23))
        last_three_to_five = len(
            BeepTransaction.objects.filter(transaction_date_time__date=(current_date - timedelta(days=1)),
                                           transaction_date_time__hour__gte=3, transaction_date_time__hour__lte=5))

        for i in range(1, last_six_to_nine):
            am_today_random_time = current_date.replace(hour=randint(6, 9), minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')

        for i in range(1, last_ten_to_one):
            am_today_random_time = current_date.replace(hour=randint(10, 13), minute=randint(0, 59))

            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=10)
            print(f'created {x}')
        for i in range(1, last_two_to_three):
            am_today_random_time = current_date.replace(hour=randint(14, 15), minute=randint(0, 59))

            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=12)
            print(f'created {x}')
        for i in range(1, last_four_to_six):
            am_today_random_time = current_date.replace(hour=randint(16, 18), minute=randint(0, 59))

            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')
        hours = [19, 20, 21, 22, 23]
        for i in range(1, last_seven_to_twelve):
            am_today_random_time = current_date.replace(hour=hours[randint(0, 4)], minute=randint(0, 59))

            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=12)
            print(f'created {x}')
        for i in range(1, last_three_to_five):
            am_today_random_time = current_date.replace(hour=randint(3, 5), minute=randint(0, 59))

            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=12)
            print(f'created {x}')

    @staticmethod
    def generate_beep(current_date):
        six_to_nine = [10, 11, 12]
        ten_to_one = [5, 6, 7]
        two_to_three = [5, 6, 7]
        four_to_six = [20, 21, 22]
        seven_to_twelve = [15, 16, 17]
        three_to_five = [2, 3, 4]

        am_shift = BeepShift.objects.create(type='A', date=current_date)
        pm_shift = BeepShift.objects.create(type='P', date=current_date)
        values = [10.00, 13.00, 15.00]

        # 6 - 9
        # 6 o clock
        for i in range(1, 19):
            am_today_random_time = current_date.replace(hour=6, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=10)
        print(f'created {x}')
        # 7 o clock
        for i in range(1, 15):
            am_today_random_time = current_date.replace(hour=7, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=10)
            print(f'created {x}')
        # 8 o clock
        for i in range(1, 4):
            am_today_random_time = current_date.replace(hour=8, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=12)
            print(f'created {x}')
            # 9 o clock
        for i in range(1, 4):
            am_today_random_time = current_date.replace(hour=9, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=10)
            print(f'created {x}')

            # 10 o clock
        for i in range(1, 2):
            am_today_random_time = current_date.replace(hour=10, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=12)
            print(f'created {x}')
            # 11 o clock
        for i in range(1, 3):
            am_today_random_time = current_date.replace(hour=11, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')
            # 12 o clock
        for i in range(1, 6):
            am_today_random_time = current_date.replace(hour=12, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')
            # 1 o clock
        for i in range(1, 3):
            am_today_random_time = current_date.replace(hour=13, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=12)
            print(f'created {x}')
            # 2 o clock
        for i in range(1, 7):
            am_today_random_time = current_date.replace(hour=14, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')
            # 3 o clock
        for i in range(1, 8):
            am_today_random_time = current_date.replace(hour=15, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=10)
            print(f'created {x}')
            # 4 o clock
        for i in range(1, 14):
            am_today_random_time = current_date.replace(hour=16, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')
            # 5 o clock
        for i in range(1, 25):
            am_today_random_time = current_date.replace(hour=17, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')
            # 6 o clock
        for i in range(1, 20):
            am_today_random_time = current_date.replace(hour=18, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')

            # 7 o clock
        for i in range(1, 15):
            am_today_random_time = current_date.replace(hour=19, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')

            # 8 o clock
        for i in range(1, 10):
            am_today_random_time = current_date.replace(hour=20, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')

            # 9 o clock
        for i in range(1, 13):
            am_today_random_time = current_date.replace(hour=21, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')
            # 10 o clock
        for i in range(1, 12):
            am_today_random_time = current_date.replace(hour=22, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')
            # 11 o clock
        for i in range(1, 10):
            am_today_random_time = current_date.replace(hour=23, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')
            # 12 o clock
        for i in range(1, 5):
            am_today_random_time = current_date.replace(hour=23, minute=59)
            x = BeepTransaction.objects.create(shift=pm_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=15)
            print(f'created {x}')

            # 4AM o clock
        for i in range(1, 5):
            am_today_random_time = current_date.replace(hour=18, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=12)
            print(f'created {x}')

            # 5AM o clock
        for i in range(1, 13):
            am_today_random_time = current_date.replace(hour=18, minute=randint(0, 59))
            x = BeepTransaction.objects.create(shift=am_shift,
                                               card_number=PopulateMembers.random_with_n_digits(8),
                                               transaction_date_time=am_today_random_time,
                                               shuttle=Shuttle.objects.order_by("?").first(),
                                               total=10)
            print(f'created {x}')
