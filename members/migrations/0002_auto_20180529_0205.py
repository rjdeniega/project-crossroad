# Generated by Django 2.0.5 on 2018-05-29 02:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='member',
            name='educational_attainment',
            field=models.CharField(choices=[('P', 'Preschool'), ('E', 'Elementary'), ('H', 'High School'), ('V', 'Vocational'), ('B', 'Bachelors Degree'), ('M', 'Masters Degree'), ('D', 'Doctorate')], max_length=1),
        ),
    ]
