from django.urls import path
from . import views

urlpatterns = [
    path('requests/', views.RequestListView.as_view(), name='request-list'),
    path('requests/<int:pk>/', views.RequestDetailView.as_view(), name='request-detail'),
    path('requests/<int:pk>/update-status/', views.UpdateRequestStatusView.as_view(), name='request-update-status'),
    path('assign-technician/<int:pk>/', views.AssignTechnicianView.as_view(), name='assign-technician'),
]
