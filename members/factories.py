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



class SupervisorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Supervisor

    name = factory.Faker('first_name_male')
    address = factory.Faker('address')
    contact_no = factory.Faker('phone_number')
    birth_date = factory.Faker('date_of_birth')
    sex = 'M'
    user = factory.SubFactory(UserFactory)
    application_date = factory.Faker('date_time')
