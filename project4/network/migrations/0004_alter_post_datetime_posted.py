# Generated by Django 3.2.8 on 2022-06-23 15:27

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_alter_post_datetime_posted'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='datetime_posted',
            field=models.DateTimeField(default=datetime.datetime(2022, 6, 23, 10, 27, 0, 187235)),
        ),
    ]
