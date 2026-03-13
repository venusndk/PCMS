from django.urls import path
from . import views
urlpatterns = [
    path('dashboard/', views.OverallDashboard.as_view(), name='dashboard'),
    path('dashboard/devices/', views.DeviceStatsDashboard.as_view(), name='dashboard-devices'),
    path('dashboard/technicians/', views.TechnicianStatsDashboard.as_view(), name='dashboard-technicians'),
    path('dashboard/requests/', views.RequestStatsDashboard.as_view(), name='dashboard-requests'),
]
