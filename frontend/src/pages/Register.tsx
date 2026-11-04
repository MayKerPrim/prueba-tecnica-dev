import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      // Endpoint de registro público en tu backend DRF (ej. /usuarios/ o /register/)
      await api.post('/usuarios/', {
        username: form.username,
        email: form.email,
        password: form.password,
        is_active: true
      });

      setSuccess('¡Cuenta creada con éxito! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err.response?.data);
      setError('Error al registrarse. Es posible que el nombre de usuario ya esté en uso.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4 fw-bold">Crear Cuenta</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control 
                required 
                type="text" 
                placeholder="Elige un usuario"
                value={form.username} 
                onChange={e => setForm({...form, username: e.target.value})} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="correo@ejemplo.com"
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control 
                required 
                type="password" 
                placeholder="••••••••"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control 
                required 
                type="password" 
                placeholder="••••••••"
                value={form.confirmPassword} 
                onChange={e => setForm({...form, confirmPassword: e.target.value})} 
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3">
              Registrarse
            </Button>

            <div className="text-center">
              <small className="text-muted">
                ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
              </small>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};