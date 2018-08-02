from django_seed import Seed
from django.contrib.auth.models import User
from remittances.models import *
from inventory.models import *
from core.models import *
from members.models import *


# this Populator is only a function thats return a django_faker.populator.Populator instance
# correctly initialized with a faker.generator.Generator instance, configured as above


def populate_users():
    seeder = Seed.seeder()
    seeder.add_entity(User, 5)
    seeder.add_entity(Driver, 10)
    insertedPks = seeder.execute()
    print(insertedPks)
