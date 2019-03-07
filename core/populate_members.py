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
    def add_member_transactions():
        values = [10.00, 13.00, 15.00]
        current_date = datetime.now() - timedelta(days=2)
        new_end_date = current_date + timedelta(days=2)
        while current_date <= new_end_date:
            am_shift = BeepShift.objects.create(type='A', date=current_date)
            pm_shift = BeepShift.objects.create(type='P', date=current_date)

            for member in Member.objects.all():
                BeepTransaction.objects.create(shift=am_shift, card_number=IDCards.objects.get(member=member).can,
                                               total=values[random.randint(0, 2)])
                BeepTransaction.objects.create(shift=pm_shift, card_number=IDCards.objects.get(member=member).can,
                                               total=values[random.randint(0, 2)])
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
    def populate_beep():
        current_date = datetime.now() - timedelta(days=2)
        new_end_date = current_date + timedelta(days=30)
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
