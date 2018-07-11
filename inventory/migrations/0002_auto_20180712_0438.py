# Generated by Django 2.0.7 on 2018-07-11 20:38

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='itemmovement',
            name='repair',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='inventory.Repair'),
        ),
        migrations.AlterField(
            model_name='itemmovement',
            name='type',
            field=models.CharField(choices=[('G', 'Get'), ('R', 'Return'), ('B', 'Bought')], max_length=1),
        ),
    ]