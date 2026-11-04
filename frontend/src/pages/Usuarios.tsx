import { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { Navbar } from '../components/Navbar';
import api from '../services/api';
import type { Usuario } from '../types';

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Estado Modal Crear/Editar
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    is_active: true,
  });

  // Estado Modal Desactivar/Activar
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState<{ id: number; username: string; targetStatus: boolean } | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await api.get('/usuarios/');
      const data = res.data.results ? res.data.results : res.data;
      setUsuarios(data);
    } catch (err) {
      setError('Error al cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleOpenModal = (usr?: Usuario) => {
    if (usr) {
      setEditingId(usr.id);
      setForm({
        username: usr.username,
        email: usr.email || '',
        password: '',
        is_active: usr.is_active,
      });
      localStorage.setItem('changedUser', usr.username);
    } else {
      setEditingId(null);
      setForm({ username: '', email: '', password: '', is_active: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload: any = { username: form.username, email: form.email, is_active: form.is_active };
      if (form.password) payload.password = form.password;

      if (editingId) {
        await api.patch(`/usuarios/${editingId}/`, payload);

        const currentLoggedUser = localStorage.getItem('username');
        const editedUser = localStorage.getItem('changedUser');
        if (currentLoggedUser === editedUser) {
          localStorage.setItem('username', form.username);
          window.dispatchEvent(new Event('newUsername'));
        }
        localStorage.removeItem('changedUser');
      } else {
        await api.post('/usuarios/', form);
      }
      setShowModal(false);
      fetchUsuarios();
    } catch (err: any) {
      console.error(err.response?.data);
      alert('Error al guardar el usuario. Revisa los datos.');
    }
  };

  const handleOpenStatusModal = (id: number, username: string, targetStatus: boolean) => {
    setUserToToggle({ id, username, targetStatus });
    setShowStatusModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;
    try {
      await api.patch(`/usuarios/${userToToggle.id}/`, { is_active: userToToggle.targetStatus });
      setShowStatusModal(false);
      setUserToToggle(null);
      fetchUsuarios();
    } catch (err) {
      alert('Error al actualizar el estado del usuario.');
    }
  };

  return (
    <>
      <Navbar />
      <Container fluid="md">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Gestión de Usuarios</h2>
          <Button variant="success" onClick={() => handleOpenModal()}>+ Nuevo Usuario</Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Cargando usuarios...</p>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email || 'N/A'}</td>
                  <td>
                    <Badge bg={u.is_active ? 'success' : 'secondary'}>
                      {u.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleOpenModal(u)}>
                      Editar
                    </Button>
                    {u.username !== localStorage.getItem('username') && (
                      u.is_active ? (
                        <Button variant="danger" size="sm" onClick={() => handleOpenStatusModal(u.id, u.username, false)}>
                          Desactivar
                        </Button>
                    ) : (
                        <Button variant="success" size="sm" onClick={() => handleOpenStatusModal(u.id, u.username, true)}>
                          Activar
                        </Button>
                    )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal Crear / Editar Usuario */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Editar Usuario' : 'Crear Usuario'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de Usuario</Form.Label>
                <Form.Control required type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control type="email" value={form.email} onChange={(e: any) => setForm({...form, email: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña {editingId && '(Déjalo en blanco para no cambiarla)'}</Form.Label>
                <Form.Control 
                  type="password" 
                  required={!editingId} 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="primary" type="submit">Guardar</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Confirmación Activar/Desactivar Usuario */}
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
          <Modal.Header closeButton className={userToToggle?.targetStatus ? "bg-success text-white" : "bg-danger text-white"}>
            <Modal.Title>
              {userToToggle?.targetStatus ? 'Confirmar Activación' : 'Confirmar Desactivación'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              ¿Estás seguro de que deseas <strong>{userToToggle?.targetStatus ? 'activar' : 'desactivar'}</strong> al usuario:
            </p>
            {userToToggle && (
              <div className="p-3 bg-light rounded text-center">
                <h5 className="mb-0 text-dark">{userToToggle.username}</h5>
              </div>
            )}
            <p className="text-muted mt-3 mb-0">
              <small>
                {userToToggle?.targetStatus 
                  ? 'El usuario recuperará el acceso al sistema.' 
                  : 'El usuario perderá acceso inmediato al sistema hasta que sea activado nuevamente.'}
              </small>
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Cancelar
            </Button>
            <Button variant={userToToggle?.targetStatus ? 'success' : 'danger'} onClick={confirmToggleStatus}>
              {userToToggle?.targetStatus ? 'Sí, Activar' : 'Sí, Desactivar'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};