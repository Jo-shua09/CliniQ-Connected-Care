
from django.contrib import admin
from .models import *


# Register your models here.
admin.site.register(UserProfile)
admin.site.register(Connection)
admin.site.register(Config)


@admin.register(DeviceRecords)
class DeviceRecordsAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return ["timestamp", "age", "gender", "temp", "blood_oxygen", "heart_rate", "sbp", "dbp", "ecg_sensor_frame"]