from django.urls import path
from . import views

urlpatterns = [
    # Static paths MUST come before parameterized <int:pk> paths
    path('requests/', views.RequestListView.as_view(), name='request-list'),
    path('requests/count/', views.RequestCountView.as_view(), name='request-count'),
    path('requests/notifications/', views.RequestNotificationsView.as_view(), name='request-notifications'),
    # Parameterized paths follow
    path('requests/<int:pk>/', views.RequestDetailView.as_view(), name='request-detail'),
    path('requests/<int:pk>/update-status/', views.UpdateRequestStatusView.as_view(), name='request-update-status'),
    path('assign-technician/<int:pk>/', views.AssignTechnicianView.as_view(), name='assign-technician'),
]
