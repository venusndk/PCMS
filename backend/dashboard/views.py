"""
Dashboard App - Views
======================
Returns statistics for the admin dashboard.
These endpoints provide summary data for charts and counters.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from django.contrib.auth import get_user_model
from django.db.models import Count

from equipment.models import PC, Accessory, NetworkDevice
from requests_app.models import Request
from reporting.models import Report
from users.permissions import IsAdminOrTechnician

User = get_user_model()


@extend_schema(tags=['Dashboard'])
class DeviceStatsDashboard(APIView):
    """
    GET /api/dashboard/devices/
    Returns counts of all devices grouped by status and category.
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = None

    @extend_schema(
        summary="Device statistics",
        description="Returns device counts grouped by category and status. Great for dashboard charts.",
        responses={200: OpenApiResponse(response=OpenApiTypes.OBJECT, description='Device stats')}
    )
    def get(self, request):
        # ── PC Stats ────────────────────────────────────────
        pc_total = PC.objects.count()
        pc_by_status = PC.objects.values('status').annotate(count=Count('id'))
        pc_working = PC.objects.filter(status='Working').count()
        pc_not_working = PC.objects.exclude(status='Working').count()

        # ── Accessory Stats ─────────────────────────────────
        accessory_total = Accessory.objects.count()
        accessory_by_status = Accessory.objects.values('status').annotate(count=Count('id'))
        accessory_by_type = Accessory.objects.values('name').annotate(count=Count('id'))

        # ── Network Device Stats ─────────────────────────────
        network_total = NetworkDevice.objects.count()
        network_by_status = NetworkDevice.objects.values('status').annotate(count=Count('id'))
        network_by_type = NetworkDevice.objects.values('name').annotate(count=Count('id'))

        # ── Overall ──────────────────────────────────────────
        all_working = (
            PC.objects.filter(status='Working').count() +
            Accessory.objects.filter(status='Working').count() +
            NetworkDevice.objects.filter(status='Working').count()
        )
        all_not_working = (
            PC.objects.exclude(status='Working').count() +
            Accessory.objects.exclude(status='Working').count() +
            NetworkDevice.objects.exclude(status='Working').count()
        )

        return Response({
            'summary': {
                'total_devices': pc_total + accessory_total + network_total,
                'working': all_working,
                'not_working': all_not_working,
            },
            'pcs': {
                'total': pc_total,
                'working': pc_working,
                'not_working': pc_not_working,
                'by_status': list(pc_by_status),
                'by_location': list(PC.objects.values('location').annotate(count=Count('id'))),
            },
            'accessories': {
                'total': accessory_total,
                'by_status': list(accessory_by_status),
                'by_type': list(accessory_by_type),
            },
            'network_devices': {
                'total': network_total,
                'by_status': list(network_by_status),
                'by_type': list(network_by_type),
            },
        })


@extend_schema(tags=['Dashboard'])
class TechnicianStatsDashboard(APIView):
    """
    GET /api/dashboard/technicians/
    Returns technician availability and workload statistics.
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = None

    @extend_schema(
        summary="Technician statistics",
        description="Returns technician availability counts and workload data.",
        responses={200: OpenApiResponse(response=OpenApiTypes.OBJECT, description='Technician stats')}
    )
    def get(self, request):
        technicians = User.objects.filter(role='Technician')

        # Count by availability status
        status_counts = technicians.values('status').annotate(count=Count('id'))

        # Individual technician workload
        technician_details = []
        for tech in technicians:
            technician_details.append({
                'id': tech.pk,
                'name': tech.full_name,
                'email': tech.email,
                'status': tech.status,
                'assigned_pcs': tech.assigned_pcs.count(),
                'assigned_accessories': tech.assigned_accessories.count(),
                'assigned_network_devices': tech.assigned_network_devices.count(),
                'assigned_requests': tech.assigned_requests.filter(
                    status__in=['Pending', 'Technician Assigned']
                ).count(),
            })

        return Response({
            'total_technicians': technicians.count(),
            'by_status': list(status_counts),
            'technicians': technician_details,
        })


@extend_schema(tags=['Dashboard'])
class RequestStatsDashboard(APIView):
    """
    GET /api/dashboard/requests/
    Returns request statistics grouped by status and type.
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = None

    @extend_schema(
        summary="Request statistics",
        responses={200: OpenApiResponse(response=OpenApiTypes.OBJECT, description='Request stats')}
    )
    def get(self, request):
        requests = Request.objects.all()

        return Response({
            'total': requests.count(),
            'pending': requests.filter(status='Pending').count(),
            'technician_assigned': requests.filter(status='Technician Assigned').count(),
            'fixed': requests.filter(status='Fixed').count(),
            'not_fixed': requests.filter(status='Not Fixed').count(),
            'by_type': list(requests.values('request_type').annotate(count=Count('id'))),
            'by_status': list(requests.values('status').annotate(count=Count('id'))),
        })


@extend_schema(tags=['Dashboard'])
class OverallDashboard(APIView):
    """
    GET /api/dashboard/
    Returns a complete overview of all statistics.
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = None

    @extend_schema(
        summary="Complete dashboard overview",
        responses={200: OpenApiResponse(response=OpenApiTypes.OBJECT, description='Full dashboard stats')}
    )
    def get(self, request):
        return Response({
            'devices': {
                'pcs': PC.objects.count(),
                'accessories': Accessory.objects.count(),
                'network_devices': NetworkDevice.objects.count(),
                'total': PC.objects.count() + Accessory.objects.count() + NetworkDevice.objects.count(),
            },
            'requests': {
                'total': Request.objects.count(),
                'pending': Request.objects.filter(status='Pending').count(),
                'assigned': Request.objects.filter(status='Technician Assigned').count(),
                'fixed': Request.objects.filter(status='Fixed').count(),
            },
            'technicians': {
                'total': User.objects.filter(role='Technician').count(),
                'available': User.objects.filter(role='Technician', status='Available').count(),
                'busy': User.objects.filter(role='Technician', status='Busy').count(),
                'not_available': User.objects.filter(role='Technician', status='Not Available').count(),
            },
            'reports': {
                'total': Report.objects.count(),
            }
        })
