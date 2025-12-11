from django.urls import path, include
from app import views


urlpatterns = [
    path("", views.home),
    path('signup', views.signup),
    path('login', views.login),
    path('create_connection', views.create_connection),
    path('get_connections', views.get_connections),
    path('get_pending_connections', views.get_pending_connections),
    path('accept_connection', views.accept_connection),
    path("set_device_id", views.set_device_id),
    path("has_device", views.has_device),
    path("set_premium", views.set_premium),
    path("is_premium", views.is_premium),

    path("device_push", views.device_push_data),
    path("device_pull", views.device_pull_data),
]