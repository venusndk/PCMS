"""
Requests App - Views
=====================
Handles ICT support requests.
- Anyone can submit a request (no login needed)
- Admin can view all requests and assign technicians
- Technicians can view and update their assigned requests
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Request
from .serializers import (
    RequestSerializer, RequestCreateSerializer,
    AssignTechnicianSerializer, UpdateRequestStatusSerializer,
    RequestNotificationSerializer
)
from users.permissions import IsAdministrator, IsAdminOrTechnician

User = get_user_model()

def _visible_requests_queryset(request):
    # Technicians only see requests assigned to them
    if request.user.is_technician:
        return Request.objects.select_related('assigned_technician').filter(
            assigned_technician=request.user
        )
    return Request.objects.select_related('assigned_technician').all()


def _parse_statuses(request):
    """
    Accepts:
    - ?status=Pending
    - ?status=pending
    - ?status=Pending,Technician%20Assigned
    - ?status=Pending&status=Fixed (repeated)
    Returns canonical DB values (e.g. "Pending").
    """
    raw = request.query_params.getlist('status')
    if not raw:
        return []

    # explode comma-separated entries
    parts = []
    for item in raw:
        if not item:
            continue
        parts.extend([p.strip() for p in str(item).split(',') if p.strip()])

    canonical = {s.lower(): s for s, _ in Request.STATUS_CHOICES}
    out = []
    for p in parts:
        key = p.lower()
        if key in canonical:
            out.append(canonical[key])
    # de-dupe, preserve order
    seen = set()
    deduped = []
    for s in out:
        if s in seen:
            continue
        seen.add(s)
        deduped.append(s)
    return deduped


@extend_schema(tags=['Requests'])
class RequestListView(APIView):
    """
    GET  /api/requests/ - List all requests (Admin & Technicians)
    POST /api/requests/ - Submit a new request (Anyone - no login needed)
    """
    serializer_class = RequestSerializer

    def get_permissions(self):
        """Different permissions for GET vs POST."""
        if self.request.method == 'POST':
            return [AllowAny()]  # Anyone can submit a request
        return [IsAdminOrTechnician()]  # Only staff can view all requests

    @extend_schema(
        summary="List all requests",
        operation_id="list_requests",
        description="Admin: see all requests. Technicians: see only their assigned requests.",
        parameters=[
            OpenApiParameter('status', OpenApiTypes.STR, description="Filter: Pending, Technician Assigned, Fixed, Not Fixed"),
            OpenApiParameter('request_type', OpenApiTypes.STR, description="Filter by request type"),
        ]
    )
    def get(self, request):
        queryset = _visible_requests_queryset(request)

        # Use _parse_statuses() for consistent multi-value filtering
        statuses = _parse_statuses(request)
        if statuses:
            queryset = queryset.filter(status__in=statuses)

        req_type = request.query_params.get('request_type')
        if req_type:
            queryset = queryset.filter(request_type=req_type)

        serializer = RequestSerializer(queryset, many=True)
        data = serializer.data
        # FIX #9: use len() instead of queryset.count() to avoid a second DB hit
        return Response({'count': len(data), 'results': data})

    @extend_schema(
        summary="Submit a new ICT support request",
        description="Anyone (employees) can submit a request without logging in.",
        request=RequestCreateSerializer,
    )
    def post(self, request):
        serializer = RequestCreateSerializer(data=request.data)
        if serializer.is_valid():
            req = serializer.save()
            return Response({
                'message': 'Your request has been submitted successfully. We will contact you soon.',
                'request_id': req.pk,
                'request': RequestSerializer(req).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Requests'])
class RequestDetailView(APIView):
    """
    GET    /api/requests/{id}/ - View a specific request
    DELETE /api/requests/{id}/ - Delete a request (Admin only)
    """
    serializer_class = RequestSerializer

    def get_permissions(self):
        """
        FIX #4: Use proper permission classes per HTTP method instead of
        a manual runtime `if not request.user.is_admin` check.
        """
        if self.request.method == 'DELETE':
            return [IsAdministrator()]
        return [IsAdminOrTechnician()]

    def get_object(self, pk):
        try:
            return Request.objects.select_related('assigned_technician').get(pk=pk)
        except Request.DoesNotExist:
            return None

    @extend_schema(summary="Get request details", operation_id="retrieve_request")
    def get(self, request, pk):
        req = self.get_object(pk)
        if not req:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(RequestSerializer(req).data)

    @extend_schema(summary="Delete a request (Admin only)")
    def delete(self, request, pk):
        req = self.get_object(pk)
        if not req:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)
        req.delete()
        return Response({'message': 'Request deleted successfully.'})


@extend_schema(tags=['Requests'])
class AssignTechnicianView(APIView):
    """
    POST /api/assign-technician/{request_id}/
    Admin assigns a technician to a request.
    """
    permission_classes = [IsAdministrator]
    serializer_class = AssignTechnicianSerializer

    @extend_schema(
        summary="Assign a technician to a request (Admin only)",
        request=AssignTechnicianSerializer,
    )
    def post(self, request, pk):
        req = Request.objects.filter(pk=pk).first()
        if not req:
            return Response(
                {'error': 'Request not found.', 'detail': 'Request not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AssignTechnicianSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    'error': 'Invalid request data.',
                    'detail': 'Missing or invalid technician_id',
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        technician_id = serializer.validated_data['technician_id']

        try:
            technician = User.objects.get(pk=technician_id, role__iexact='Technician')
        except User.DoesNotExist:
            return Response(
                {
                    'error': 'Technician not found.',
                    'detail': f'No technician with ID {technician_id}'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # FIX #7: Wrap all assignment DB writes in a single atomic transaction.
        # If any save() fails, all changes are rolled back — no inconsistent state.
        try:
            with transaction.atomic():
                # If re-assigning: free up the previously assigned technician
                if req.assigned_technician and req.assigned_technician.pk != technician.pk:
                    old_tech = req.assigned_technician
                    old_tech.status = 'Available'
                    old_tech.save()

                req.assigned_technician = technician
                req.status = 'Technician Assigned'
                req.save()

                # Mark the new technician as Busy
                technician.status = 'Busy'
                technician.save()
        except Exception as e:
            return Response(
                {
                    'error': 'Failed to save assignment to database.',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Return successful response with proper status code
        return Response(
            {
                'message': f'Technician {technician.full_name} has been assigned to request #{req.pk}.',
                'request': RequestSerializer(req).data,
                'success': True
            },
            status=status.HTTP_200_OK
        )


@extend_schema(tags=['Requests'])
class UpdateRequestStatusView(APIView):
    """
    POST /api/requests/{id}/update-status/
    Technician updates the status of an assigned request.
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = UpdateRequestStatusSerializer

    @extend_schema(
        summary="Update request status (Fixed / Not Fixed)",
        description="Technicians can mark their assigned requests as Fixed or Not Fixed.",
        request=UpdateRequestStatusSerializer,
    )
    def post(self, request, pk):
        req = Request.objects.filter(pk=pk).first()
        if not req:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        # FIX #5: Use the is_technician property (consistent case-insensitive check)
        # instead of comparing raw role string which is case-sensitive.
        if request.user.is_technician and req.assigned_technician != request.user:
            return Response({'error': 'You can only update requests assigned to you.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = UpdateRequestStatusSerializer(data=request.data)
        if serializer.is_valid():
            # FIX #8: Wrap status update and technician status reset in an atomic transaction.
            with transaction.atomic():
                req.status = serializer.validated_data['status']
                req.save()

                # If resolved, set technician back to Available
                if req.assigned_technician and req.status in ['Fixed', 'Not Fixed']:
                    req.assigned_technician.status = 'Available'
                    req.assigned_technician.save()

            return Response({
                'message': f'Request #{req.pk} status updated to: {req.status}',
                'request': RequestSerializer(req).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Requests'])
class RequestCountView(APIView):
    """
    GET /api/requests/count/?status=Pending
    Returns a cheap count for notification badges.
    """
    permission_classes = [IsAdminOrTechnician]

    @extend_schema(
        summary="Count requests by status",
        operation_id="count_requests",
        parameters=[
            OpenApiParameter(
                'status',
                OpenApiTypes.STR,
                description="Filter by status. Supports repeated params and comma-separated values. Example: status=Pending or status=pending",
            ),
        ],
    )
    def get(self, request):
        qs = _visible_requests_queryset(request)
        statuses = _parse_statuses(request)
        if statuses:
            qs = qs.filter(status__in=statuses)
        return Response({'count': qs.count()})


@extend_schema(tags=['Requests'])
class RequestNotificationsView(APIView):
    """
    GET /api/requests/notifications/?status=Pending&limit=5
    Returns count + a small "recent requests" list for a dropdown.
    """
    permission_classes = [IsAdminOrTechnician]

    @extend_schema(
        summary="Requests notification payload (count + recent)",
        operation_id="requests_notifications",
        parameters=[
            OpenApiParameter('status', OpenApiTypes.STR, description="Same as /api/requests/count/"),
            OpenApiParameter('limit', OpenApiTypes.INT, description="How many recent items to return (default 5, max 20)"),
        ],
    )
    def get(self, request):
        qs = _visible_requests_queryset(request)
        statuses = _parse_statuses(request)
        if statuses:
            qs = qs.filter(status__in=statuses)

        try:
            limit = int(request.query_params.get('limit', 5))
        except (TypeError, ValueError):
            limit = 5
        limit = max(1, min(limit, 20))

        recent_qs = qs.order_by('-date', '-id')[:limit]
        recent = RequestNotificationSerializer(recent_qs, many=True).data
        return Response({'count': qs.count(), 'recent': recent})
