# Generated by Django 3.2.8 on 2022-06-24 21:05

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0008_auto_20220624_1258'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='datetime_posted',
            field=models.DateTimeField(default=datetime.datetime(2022, 6, 24, 16, 5, 12, 808059)),
        ),
    ]
