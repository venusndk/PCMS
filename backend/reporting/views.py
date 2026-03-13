"""
Reporting App - Views
======================
Technicians create maintenance reports. Admins can view all reports.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .models import Report
from .serializers import ReportSerializer, ReportCreateSerializer
from users.permissions import IsAdminOrTechnician, IsAdministrator


@extend_schema(tags=['Reports'])
class ReportListView(APIView):
    """
    GET  /api/reports/ - List all reports
    POST /api/reports/ - Create a maintenance report (Technicians)
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = ReportSerializer

    @extend_schema(
        summary="List all maintenance reports",
        operation_id="list_reports",
        parameters=[
            OpenApiParameter('device_type', OpenApiTypes.STR, description="Filter by: PC, Accessory, NetworkDevice"),
            OpenApiParameter('technician', OpenApiTypes.INT, description="Filter by technician ID"),
        ]
    )
    def get(self, request):
        queryset = Report.objects.all()

        # Technicians see only their own reports
        if request.user.role == 'Technician':
            queryset = queryset.filter(technician=request.user)

        device_type = request.query_params.get('device_type')
        technician = request.query_params.get('technician')

        if device_type:
            queryset = queryset.filter(device_type=device_type)
        if technician and request.user.is_admin:
            queryset = queryset.filter(technician_id=technician)

        serializer = ReportSerializer(queryset, many=True)
        return Response({'count': queryset.count(), 'results': serializer.data})

    @extend_schema(
        summary="Create a maintenance report",
        request=ReportCreateSerializer,
    )
    def post(self, request):
        serializer = ReportCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically set the technician to the logged-in user
            report = serializer.save(technician=request.user)
            return Response({
                'message': 'Report created successfully.',
                'report': ReportSerializer(report).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Reports'])
class ReportDetailView(APIView):
    """GET /api/reports/{id}/ | DELETE /api/reports/{id}/"""
    permission_classes = [IsAdminOrTechnician]
    serializer_class = ReportSerializer

    def get_object(self, pk):
        try:
            return Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return None

    @extend_schema(summary="Get report details", operation_id="retrieve_report")
    def get(self, request, pk):
        report = self.get_object(pk)
        if not report:
            return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ReportSerializer(report).data)

    @extend_schema(summary="Delete report (Admin only)")
    def delete(self, request, pk):
        if not request.user.is_admin:
            return Response({'error': 'Only Administrators can delete reports.'}, status=status.HTTP_403_FORBIDDEN)
        report = self.get_object(pk)
        if not report:
            return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)
        report.delete()
        return Response({'message': 'Report deleted successfully.'})
