from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from .models import Producto
from .serializers import ProductoSerializer, UserSerializer

class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        # Permitir registro público (POST), pero exigir autenticación para listar/editar
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_destroy(self, instance):
        # Desactivar en lugar de borrar físicamente
        instance.is_active = False
        instance.save()

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().order_by('-id')
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]