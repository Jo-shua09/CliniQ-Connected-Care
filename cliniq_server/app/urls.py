from django.urls import path, include
from app import views


urlpatterns = [
    path("", views.home),
    path('signup', views.signup),
    path('login', views.login),
    path('create_connection', views.create_connection),
    path('get_connections', views.get_connections),
    path('accept_connection', views.accept_connection),
    path('cancel_connection', views.cancel_connection),
    path("set_device_id", views.set_device_id),
    path("has_device", views.has_device),
    path("set_premium", views.set_premium),
    path("is_premium", views.is_premium),
    path("device_push", views.device_push_data),
    path("user_profile", views.user_profile),
    path("user_profiles", views.user_profiles),
    path("get_vitals", views.get_vitals),
    # path("has_vitals", views.has_vitals),
]