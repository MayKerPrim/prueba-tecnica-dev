export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: string | number;
  categoria: string;
  stock: number;
  estado: 'activo' | 'inactivo';
  fecha_registro: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  password?: string;
}