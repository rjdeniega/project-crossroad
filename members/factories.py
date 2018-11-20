import factory
import factory.django
from members.models import *
from django.contrib.auth.models import User

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: 'user%d' % n)
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email = factory.LazyAttribute(lambda obj: '%s@example.com' % obj.username)
    password = hash("admin1234")


class PersonFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Person

    name = factory.Faker('first_name_male')
    address = factory.Faker('address')
    contact_no = factory.Faker('phone_number')
    birth_date = factory.Faker('date_of_birth')
    sex = 'M'


class SupervisorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Supervisor

    person_ptr = factory.SubFactory(PersonFactory)
    user = factory.SubFactory(UserFactory)
    application_date = factory.Faker('date_time')
