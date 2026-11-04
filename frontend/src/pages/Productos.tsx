import { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { Navbar } from '../components/Navbar';
import api from '../services/api';
import type { Producto } from '../types';

export const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Estado Modal Crear/Editar
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    stock: 0,
    estado: 'activo' as 'activo' | 'inactivo',
  });

  // Estado Modal Eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/productos/');
      // Manejar respuesta paginada o lista directa
      const data = res.data.results ? res.data.results : res.data;
      setProductos(data);
    } catch (err) {
      setError('Error al cargar la lista de productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const formatMXN = (amount: number | string) => {
    const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(numeric);
  };

  const handleOpenModal = (prod?: Producto) => {
    if (prod) {
      setEditingId(prod.id);
      setForm({
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        precio: prod.precio.toString(),
        categoria: prod.categoria,
        stock: prod.stock,
        estado: prod.estado,
      });
    } else {
      setEditingId(null);
      setForm({ nombre: '', descripcion: '', precio: '', categoria: '', stock: 0, estado: 'activo' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/productos/${editingId}/`, form);
      } else {
        await api.post('/productos/', form);
      }
      setShowModal(false);
      fetchProductos();
    } catch (err: any) {
      alert(err.response?.data?.precio || 'Error al guardar el producto. Revisa los datos.');
    }
  };

  const handleOpenDeleteModal = (prod: Producto) => {
    setProductToDelete(prod);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/productos/${productToDelete.id}/`);
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchProductos();
    } catch (err) {
      alert('Error al eliminar producto.');
    }
  };

  return (
    <>
      <Navbar />
      <Container fluid="md">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Gestión de Productos</h2>
          <Button variant="success" onClick={() => handleOpenModal()}>+ Nuevo Producto</Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Cargando productos...</p>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion || 'Sin descripción'}</td>
                  <td>{p.categoria}</td>
                  <td><strong>{formatMXN(p.precio)}</strong></td>
                  <td>{p.stock}</td>
                  <td>
                    <Badge bg={p.estado === 'activo' ? 'success' : 'secondary'}>
                      {p.estado.toLocaleUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleOpenModal(p)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleOpenDeleteModal(p)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal Crear / Editar */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Editar Producto' : 'Crear Producto'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control required type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Descripción (Opcional)</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  value={form.descripcion} 
                  onChange={e => setForm({...form, descripcion: e.target.value})} 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  list="categorias-list"
                  placeholder="Escribe o selecciona una categoría"
                  value={form.categoria} 
                  onChange={e => setForm({...form, categoria: e.target.value})} 
                />
                <datalist id="categorias-list">
                  {Array.from(new Set(productos.map(p => p.categoria))).map((cat, index) => (
                    <option key={index} value={cat} />
                  ))}
                </datalist>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Precio</Form.Label>
                <Form.Control required type="number" step="0.01" min="0.01" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control required type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select value={form.estado} onChange={e => setForm({...form, estado: e.target.value as 'activo' | 'inactivo'})}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="primary" type="submit">Guardar</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal de Confirmación de Eliminación */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>Confirmar Eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas eliminar el producto?</p>
            {productToDelete && (
              <div className="p-3 bg-light rounded">
                <strong>{productToDelete.nombre}</strong> <br />
                {productToDelete.descripcion && (
                  <p className="text-secondary mb-1" style={{ fontSize: '0.9rem' }}>
                    {productToDelete.descripcion}
                  </p>
                )}
                <small className="text-muted">Categoría: {productToDelete.categoria} | Precio: {formatMXN(productToDelete.precio)}</small>
              </div>
            )}
            <p className="text-danger mt-3 mb-0"><small>Esta acción no se puede deshacer.</small></p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Sí, Eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};