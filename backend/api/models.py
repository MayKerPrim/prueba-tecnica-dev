from django.db import models
from django.core.validators import MinValueValidator

# Tabla productos
class Producto(models.Model):
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01)])
    categoria = models.CharField(max_length=100)
    stock = models.IntegerField(validators=[MinValueValidator(0)])
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='activo')
    fecha_registro = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} - ${self.precio}"
