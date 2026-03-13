"""
Equipment App - Views
======================
Views for managing PCs, Accessories, and Network Devices.

Pattern used:
- List + Create in one view (GET all / POST new)
- Detail in another view (GET one / PUT update / DELETE)
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes

from .models import PC, Accessory, NetworkDevice
from .serializers import (
    PCSerializer, PCWriteSerializer,
    AccessorySerializer, AccessoryWriteSerializer,
    NetworkDeviceSerializer, NetworkDeviceWriteSerializer,
)
from users.permissions import IsAdministrator, IsAdminOrTechnician


# ─────────────────────────────────────────────────────────────
# PC VIEWS
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['PCs'])
class PCListView(APIView):
    """
    GET  /api/pcs/  - List all PCs (with optional filters)
    POST /api/pcs/  - Register a new PC (Technicians and Admins)
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = PCSerializer

    @extend_schema(
        summary="List all PCs",
        operation_id="list_pcs",
        description="Returns all PCs. Filter by location or status using query params.",
        parameters=[
            OpenApiParameter('location', OpenApiTypes.STR, description="Filter by location: Lab or Office"),
            OpenApiParameter('status', OpenApiTypes.STR, description="Filter by status: Working, Not Working, Damaged, Old"),
            OpenApiParameter('technician', OpenApiTypes.INT, description="Filter by assigned technician ID"),
        ]
    )
    def get(self, request):
        queryset = PC.objects.all()

        # Apply filters if provided in the URL (?location=Lab&status=Working)
        location = request.query_params.get('location')
        pc_status = request.query_params.get('status')
        technician = request.query_params.get('technician')

        if location:
            queryset = queryset.filter(location=location)
        if pc_status:
            queryset = queryset.filter(status=pc_status)
        if technician:
            queryset = queryset.filter(technician_assigned_id=technician)

        serializer = PCSerializer(queryset, many=True)
        return Response({'count': queryset.count(), 'results': serializer.data})

    @extend_schema(
        summary="Register a new PC",
        request=PCWriteSerializer,
        examples=[
            OpenApiExample(
                'Example',
                value={
                    "brand": "Dell",
                    "ram": "8GB",
                    "hdd": "500GB HDD",
                    "operating_system": "Windows 10",
                    "registration_year": 2022,
                    "location": "Lab",
                    "status": "Working",
                    "technician_assigned": 2
                }
            )
        ]
    )
    def post(self, request):
        serializer = PCWriteSerializer(data=request.data)
        if serializer.is_valid():
            pc = serializer.save()
            return Response({
                'message': 'PC registered successfully.',
                'pc': PCSerializer(pc).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['PCs'])
class PCDetailView(APIView):
    """
    GET    /api/pcs/{id}/ - Get a single PC
    PUT    /api/pcs/{id}/ - Update a PC
    DELETE /api/pcs/{id}/ - Delete a PC (Admin only)
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = PCSerializer

    def get_object(self, pk):
        try:
            return PC.objects.get(pk=pk)
        except PC.DoesNotExist:
            return None

    @extend_schema(summary="Get PC details", operation_id="retrieve_pc")
    def get(self, request, pk):
        pc = self.get_object(pk)
        if not pc:
            return Response({'error': 'PC not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PCSerializer(pc).data)

    @extend_schema(summary="Update PC", request=PCWriteSerializer)
    def put(self, request, pk):
        pc = self.get_object(pk)
        if not pc:
            return Response({'error': 'PC not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PCWriteSerializer(pc, data=request.data, partial=True)
        if serializer.is_valid():
            pc = serializer.save()
            return Response({'message': 'PC updated.', 'pc': PCSerializer(pc).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(summary="Delete PC")
    def delete(self, request, pk):
        # Only admins can delete
        if not request.user.is_admin:
            return Response({'error': 'Only Administrators can delete equipment.'}, status=status.HTTP_403_FORBIDDEN)
        pc = self.get_object(pk)
        if not pc:
            return Response({'error': 'PC not found.'}, status=status.HTTP_404_NOT_FOUND)
        pc.delete()
        return Response({'message': 'PC deleted successfully.'})


# ─────────────────────────────────────────────────────────────
# ACCESSORY VIEWS
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['Accessories'])
class AccessoryListView(APIView):
    """
    GET  /api/accessories/ - List all accessories
    POST /api/accessories/ - Register a new accessory
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = AccessorySerializer

    @extend_schema(
        summary="List all accessories",
        operation_id="list_accessories",
        parameters=[
            OpenApiParameter('location', OpenApiTypes.STR, description="Filter by location"),
            OpenApiParameter('status', OpenApiTypes.STR, description="Filter by status"),
            OpenApiParameter('name', OpenApiTypes.STR, description="Filter by type: Mouse, Keyboard, Monitor, etc."),
        ]
    )
    def get(self, request):
        queryset = Accessory.objects.all()
        location = request.query_params.get('location')
        acc_status = request.query_params.get('status')
        name = request.query_params.get('name')

        if location:
            queryset = queryset.filter(location__icontains=location)
        if acc_status:
            queryset = queryset.filter(status=acc_status)
        if name:
            queryset = queryset.filter(name=name)

        serializer = AccessorySerializer(queryset, many=True)
        return Response({'count': queryset.count(), 'results': serializer.data})

    @extend_schema(summary="Register a new accessory", request=AccessoryWriteSerializer)
    def post(self, request):
        serializer = AccessoryWriteSerializer(data=request.data)
        if serializer.is_valid():
            accessory = serializer.save()
            return Response({
                'message': 'Accessory registered successfully.',
                'accessory': AccessorySerializer(accessory).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Accessories'])
class AccessoryDetailView(APIView):
    """
    GET /api/accessories/{id}/ | PUT /api/accessories/{id}/ | DELETE /api/accessories/{id}/
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = AccessorySerializer

    def get_object(self, pk):
        try:
            return Accessory.objects.get(pk=pk)
        except Accessory.DoesNotExist:
            return None

    @extend_schema(summary="Get accessory details", operation_id="retrieve_accessory")
    def get(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return Response({'error': 'Accessory not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AccessorySerializer(obj).data)

    @extend_schema(summary="Update accessory", request=AccessoryWriteSerializer)
    def put(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return Response({'error': 'Accessory not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AccessoryWriteSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            obj = serializer.save()
            return Response({'message': 'Accessory updated.', 'accessory': AccessorySerializer(obj).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(summary="Delete accessory")
    def delete(self, request, pk):
        if not request.user.is_admin:
            return Response({'error': 'Only Administrators can delete equipment.'}, status=status.HTTP_403_FORBIDDEN)
        obj = self.get_object(pk)
        if not obj:
            return Response({'error': 'Accessory not found.'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({'message': 'Accessory deleted successfully.'})


# ─────────────────────────────────────────────────────────────
# NETWORK DEVICE VIEWS
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['Network Devices'])
class NetworkDeviceListView(APIView):
    """
    GET  /api/network-devices/ - List all network devices
    POST /api/network-devices/ - Register a new network device
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = NetworkDeviceSerializer

    @extend_schema(
        summary="List all network devices",
        operation_id="list_network_devices",
        parameters=[
            OpenApiParameter('location', OpenApiTypes.STR, description="Filter by location"),
            OpenApiParameter('status', OpenApiTypes.STR, description="Filter by status"),
            OpenApiParameter('name', OpenApiTypes.STR, description="Filter by type: Router, Switch, etc."),
        ]
    )
    def get(self, request):
        queryset = NetworkDevice.objects.all()
        location = request.query_params.get('location')
        nd_status = request.query_params.get('status')
        name = request.query_params.get('name')

        if location:
            queryset = queryset.filter(location__icontains=location)
        if nd_status:
            queryset = queryset.filter(status=nd_status)
        if name:
            queryset = queryset.filter(name=name)

        serializer = NetworkDeviceSerializer(queryset, many=True)
        return Response({'count': queryset.count(), 'results': serializer.data})

    @extend_schema(summary="Register a new network device", request=NetworkDeviceWriteSerializer)
    def post(self, request):
        serializer = NetworkDeviceWriteSerializer(data=request.data)
        if serializer.is_valid():
            device = serializer.save()
            return Response({
                'message': 'Network device registered successfully.',
                'device': NetworkDeviceSerializer(device).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Network Devices'])
class NetworkDeviceDetailView(APIView):
    """
    GET /api/network-devices/{id}/ | PUT | DELETE
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = NetworkDeviceSerializer

    def get_object(self, pk):
        try:
            return NetworkDevice.objects.get(pk=pk)
        except NetworkDevice.DoesNotExist:
            return None

    @extend_schema(summary="Get network device details", operation_id="retrieve_network_device")
    def get(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return Response({'error': 'Network device not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(NetworkDeviceSerializer(obj).data)

    @extend_schema(summary="Update network device", request=NetworkDeviceWriteSerializer)
    def put(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return Response({'error': 'Network device not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = NetworkDeviceWriteSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            obj = serializer.save()
            return Response({'message': 'Network device updated.', 'device': NetworkDeviceSerializer(obj).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(summary="Delete network device")
    def delete(self, request, pk):
        if not request.user.is_admin:
            return Response({'error': 'Only Administrators can delete equipment.'}, status=status.HTTP_403_FORBIDDEN)
        obj = self.get_object(pk)
        if not obj:
            return Response({'error': 'Network device not found.'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({'message': 'Network device deleted successfully.'})


# ─────────────────────────────────────────────────────────────
# MY EQUIPMENT (Technician's assigned equipment)
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['PCs'])
class MyEquipmentView(APIView):
    """
    GET /api/my-equipment/ - Get all equipment assigned to the logged-in technician.
    """
    permission_classes = [IsAdminOrTechnician]
    serializer_class = PCSerializer

    @extend_schema(summary="Get my assigned equipment")
    def get(self, request):
        user = request.user
        pcs = PC.objects.filter(technician_assigned=user)
        accessories = Accessory.objects.filter(technician_assigned=user)
        network_devices = NetworkDevice.objects.filter(technician_assigned=user)

        return Response({
            'technician': f"{user.full_name}",
            'pcs': PCSerializer(pcs, many=True).data,
            'accessories': AccessorySerializer(accessories, many=True).data,
            'network_devices': NetworkDeviceSerializer(network_devices, many=True).data,
        })
