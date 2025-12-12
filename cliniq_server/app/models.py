from django.db import models


class Config(models.Model):
    age = models.IntegerField()
    gender = models.IntegerField()


class Connection(models.Model):
    id = models.AutoField(primary_key=True)
    monitored = models.ForeignKey('UserProfile', related_name='connections_from', on_delete=models.CASCADE)
    monitored_by = models.ForeignKey('UserProfile', related_name='connections_to', on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    access_diet_data = models.BooleanField(default=False)
    access_vital_signs_data = models.BooleanField(default=False)


class DeviceRecords(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    temp = models.FloatField(blank=True, null=True)
    heart_rate = models.IntegerField(blank=True, null=True)
    blood_oxygen = models.FloatField(blank=True, null=True)
    sbp = models.IntegerField(blank=True, null=True)  # Systolic Blood Pressure
    dbp = models.IntegerField(blank=True, null=True)  # Diastolic Blood Pressure
    ecg_sensor_frame = models.TextField(blank=True, null=True)


class UserProfile(models.Model):
    surname = models.CharField(max_length=150)
    first_name = models.CharField(max_length=150)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    device_id = models.CharField(max_length=255, blank=True, null=True)
    diet_summary = models.TextField(blank=True, null=True)
    mental_health_summary = models.TextField(blank=True, null=True)
    model_context = models.TextField(blank=True, null=True)
    premium_plan = models.BooleanField(default=False)
    def __str__(self):
        return str(self.username)