# Generated by Django 2.0.7 on 2018-07-25 14:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='photo',
            field=models.FileField(default='client/src/images/default.png', upload_to=''),
        ),
    ]