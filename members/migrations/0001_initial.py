# Generated by Django 2.0.5 on 2018-07-04 13:55

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='IDCards',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('archiver', models.CharField(blank=True, max_length=32)),
                ('can', models.PositiveIntegerField()),
                ('register_date', models.DateField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Person',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('archiver', models.CharField(blank=True, max_length=32)),
                ('name', models.CharField(max_length=64)),
                ('email', models.CharField(blank=True, max_length=64, null=True)),
                ('contact_no', models.PositiveIntegerField()),
                ('address', models.CharField(max_length=256)),
                ('birth_date', models.DateField()),
                ('sex', models.CharField(choices=[('M', 'Male'), ('F', 'Female')], max_length=1)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Share',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('archiver', models.CharField(blank=True, max_length=32)),
                ('value', models.DecimalField(decimal_places=2, max_digits=6)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ShareCertificate',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('archiver', models.CharField(blank=True, max_length=32)),
                ('serial_number', models.CharField(max_length=64)),
                ('quantity', models.PositiveIntegerField()),
                ('date_created', models.DateField()),
                ('date_issued', models.DateField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Driver',
            fields=[
                ('person_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='members.Person')),
                ('application_date', models.DateField()),
                ('user', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
            bases=('members.person',),
        ),
        migrations.CreateModel(
            name='Member',
            fields=[
                ('person_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='members.Person')),
                ('tin_number', models.PositiveIntegerField()),
                ('accepted_date', models.DateField()),
                ('civil_status', models.CharField(choices=[('S', 'Single'), ('M', 'Married')], max_length=1)),
                ('educational_attainment', models.CharField(choices=[('P', 'Preschool'), ('E', 'Elementary'), ('H', 'High School'), ('V', 'Vocational'), ('B', 'Bachelors Degree'), ('M', 'Masters Degree'), ('D', 'Doctorate')], max_length=1)),
                ('occupation', models.CharField(max_length=64)),
                ('no_of_dependents', models.PositiveIntegerField()),
                ('religion', models.CharField(max_length=64)),
                ('annual_income', models.PositiveIntegerField()),
                ('termination_date', models.DateField()),
                ('BOD_resolution', models.CharField(max_length=64)),
                ('user', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
            bases=('members.person',),
        ),
        migrations.CreateModel(
            name='Prospect',
            fields=[
                ('person_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='members.Person')),
                ('can', models.PositiveIntegerField()),
            ],
            options={
                'abstract': False,
            },
            bases=('members.person',),
        ),
        migrations.AddField(
            model_name='sharecertificate',
            name='member',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='members.Member'),
        ),
        migrations.AddField(
            model_name='share',
            name='member',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='members.Member'),
        ),
        migrations.AddField(
            model_name='idcards',
            name='member',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='members.Member'),
        ),
    ]
