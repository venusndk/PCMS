from django.urls import path
from . import views

urlpatterns = [
    # PCs
    path('pcs/', views.PCListView.as_view(), name='pc-list'),
    path('pcs/<int:pk>/', views.PCDetailView.as_view(), name='pc-detail'),

    # Accessories
    path('accessories/', views.AccessoryListView.as_view(), name='accessory-list'),
    path('accessories/<int:pk>/', views.AccessoryDetailView.as_view(), name='accessory-detail'),

    # Network Devices
    path('network-devices/', views.NetworkDeviceListView.as_view(), name='network-device-list'),
    path('network-devices/<int:pk>/', views.NetworkDeviceDetailView.as_view(), name='network-device-detail'),

    # My Assigned Equipment
    path('my-equipment/', views.MyEquipmentView.as_view(), name='my-equipment'),
]
