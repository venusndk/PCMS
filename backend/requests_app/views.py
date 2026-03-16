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

from .models import Request
from .serializers import (
    RequestSerializer, RequestCreateSerializer,
    AssignTechnicianSerializer, UpdateRequestStatusSerializer
)
from users.permissions import IsAdministrator, IsAdminOrTechnician

User = get_user_model()


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
        # Technicians only see requests assigned to them
        if request.user.role and request.user.role.lower() == 'technician':
            queryset = Request.objects.filter(assigned_technician=request.user)
        else:
            queryset = Request.objects.all()

        # Apply filters
        req_status = request.query_params.get('status')
        req_type = request.query_params.get('request_type')

        if req_status:
            queryset = queryset.filter(status=req_status)
        if req_type:
            queryset = queryset.filter(request_type=req_type)

        serializer = RequestSerializer(queryset, many=True)
        return Response({'count': queryset.count(), 'results': serializer.data})

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
    GET /api/requests/{id}/ - View a specific request
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = RequestSerializer

    def get_object(self, pk):
        try:
            return Request.objects.get(pk=pk)
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
        if not request.user.is_admin:
            return Response({'error': 'Only Administrators can delete requests.'}, status=status.HTTP_403_FORBIDDEN)
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
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AssignTechnicianSerializer(data=request.data)
        if serializer.is_valid():
            technician_id = serializer.validated_data['technician_id']

            try:
                technician = User.objects.get(pk=technician_id, role__iexact='Technician')
            except User.DoesNotExist:
                return Response({'error': 'Technician not found.'}, status=status.HTTP_404_NOT_FOUND)

            req.assigned_technician = technician
            req.status = 'Technician Assigned'
            req.save()

            # Update technician status to Busy
            technician.status = 'Busy'
            technician.save()

            return Response({
                'message': f'Technician {technician.full_name} has been assigned to request #{req.pk}.',
                'request': RequestSerializer(req).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

        # Technicians can only update requests assigned to them
        if request.user.role == 'Technician' and req.assigned_technician != request.user:
            return Response({'error': 'You can only update requests assigned to you.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = UpdateRequestStatusSerializer(data=request.data)
        if serializer.is_valid():
            req.status = serializer.validated_data['status']
            req.save()

            # If fixed, set technician status back to Available
            if req.assigned_technician and req.status in ['Fixed', 'Not Fixed']:
                req.assigned_technician.status = 'Available'
                req.assigned_technician.save()

            return Response({
                'message': f'Request #{req.pk} status updated to: {req.status}',
                'request': RequestSerializer(req).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
