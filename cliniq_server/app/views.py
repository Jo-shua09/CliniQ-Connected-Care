from django.http import JsonResponse
from django.shortcuts import render, redirect
from app.models import *
import random
import os
import datetime
from django.utils import timezone


deployed_on_pythonanywhere = False
if os.getenv("PYTHONANYWHERE_DOMAIN_") is not None:
    deployed_on_pythonanywhere = True
    global model
    import tensorflow as tf
    model_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "model.keras")
    model = tf.keras.models.load_model(model_path)



def home(request):
    return redirect("/admin")


def signup(request):
    surname = request.GET["surname"]
    first_name = request.GET["first_name"]
    username = request.GET["username"]
    password = request.GET["password"]
    phone_number = request.GET["phone_number"]
    email = request.GET["email"]
    age = request.GET["age"]
    gender = request.GET["gender"]

    if not UserProfile.objects.filter(username=username).exists():
        UserProfile.objects.create(
            surname=surname,
            first_name=first_name,
            username=username,
            password=password,
            email=email,
            age=age,
            gender=gender.lower(),
            phone_number=phone_number
        )
        return JsonResponse({"success": True})
    return JsonResponse({"success": False})


def login(request):
    username = request.GET["username"]
    password = request.GET["password"]

    if UserProfile.objects.filter(username=username, password=password).exists():
        return JsonResponse({"success": True})
    return JsonResponse({"success": False})


def create_connection(request):
    monitored_username = request.GET["monitored"]
    monitored_by_username = request.GET["monitored_by"]

    monitored = UserProfile.objects.get(username=monitored_username)
    monitored_by = UserProfile.objects.get(username=monitored_by_username)

    if not Connection.objects.filter(monitored=monitored, monitored_by=monitored_by).exists():
        Connection.objects.create(
            monitored=monitored,
            monitored_by=monitored_by
        )
        return JsonResponse({"success": True})
    return JsonResponse({"success": False})


def get_connections(request):
    username = request.GET["username"]
    user = UserProfile.objects.get(username=username)

    monitoring = []
    monitored_by = []

    for conn in Connection.objects.filter(monitored=user):
        monitored_by.append({
            "username": conn.monitored_by.username,
            "email": conn.monitored_by.email,
            "accepted": conn.accepted,
            "id": conn.id,
        })
    for conn in Connection.objects.filter(monitored_by=user):
        monitoring.append({
            "username": conn.monitored.username,
            "email": conn.monitored.email,
            "accepted": conn.accepted,
            "id": conn.id,
        })
    return JsonResponse({"monitoring": monitoring, "monitored_by": monitored_by})


def accept_connection(request):
    connection_id = request.GET["id"]
    connection = Connection.objects.get(id=connection_id)
    connection.accepted = True
    connection.save()
    return JsonResponse({"success": True})


def cancel_connection(request):
    connection_id = request.GET["id"]
    connection = Connection.objects.get(id=connection_id)
    connection.delete()
    return JsonResponse({"success": True})

def set_device_id(request):
    username = request.GET["username"]
    device_id = request.GET["device_id"]
    user = UserProfile.objects.get(username=username)
    user.device_id = device_id
    user.save()
    return JsonResponse({"success": True})


def has_device(request):
    username = request.GET["username"]
    user = UserProfile.objects.get(username=username)
    return JsonResponse({"value": user.device_id is not None and user.device_id != ""})


def set_premium(request):
    username = request.GET["username"]
    value = request.GET["value"]
    user = UserProfile.objects.get(username=username)
    user.premium_plan = value
    user.save()
    return JsonResponse({"success": True})


def is_premium(request):
    username = request.GET["username"]
    user = UserProfile.objects.get(username=username)
    return JsonResponse({"value": user.premium_plan})


def getBP(age, gender, spo2, bpm, temp):
    if deployed_on_pythonanywhere:
        import tensorflow as tf
        pred = model.predict(tf.constant([[int(age), int(gender), int(spo2), int(bpm), float(temp)]]))
        return pred[0][0], pred[0][1]
    return random.randint(110, 130), random.randint(70, 90)


def device_push_data(request):
    config = Config.objects.all()[0]

    age = config.age
    gender = config.gender
    spo2 = int(request.GET["spo2"])
    bpm = int(request.GET["bpm"])
    temp = float(request.GET["temp"])
    sbp, dbp = getBP(age, gender, spo2, bpm, temp)

    DeviceRecords.objects.create(age=age, gender=gender, spo2=spo2, bpm=bpm, temp=temp, sbp=sbp, dbp=dbp)
    return JsonResponse({"success": True})

def user_profile(request):
    username = request.GET["username"]
    user = UserProfile.objects.get(username=username)
    return JsonResponse({
        "surname": user.surname,
        "first_name": user.first_name,
        "username": user.username,
        "email": user.email,
        "age": user.age,
        "gender": user.gender,
        "premium_plan": user.premium_plan,
        "device_id": user.device_id,
    })

def user_profiles(request):
    users = []
    for user in UserProfile.objects.all():
        users.append({
            "surname": user.surname,
            "first_name": user.first_name,
            "username": user.username,
            "email": user.email,
            "age": user.age,
            "gender": user.gender,
            "premium_plan": user.premium_plan,
            "device_id": user.device_id,
        })
    return JsonResponse({"users": users})

def get_vitals(request):
    username = request.GET["username"]
    if username.device_id != "56781234":
        return JsonResponse({"has_vitals": False})
    
    record = DeviceRecords.objects.last()
    time_diff = timezone.now() - record.timestamp
    seconds_diff = time_diff.total_seconds()
    return JsonResponse({
        "has_vitals": True,
        "temp": record.temp,
        "heart_rate": record.heart_rate,
        "blood_oxygen": record.blood_oxygen,
        "sbp": record.sbp,
        "dbp": record.dbp,
        "ecg_sensor_frame": list(record.ecg_sensor_frame),
        "time_diff_seconds": seconds_diff,
    })



