import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import api from '../services/api';

export const Dashboard = () => {
  const [totalProductos, setTotalProductos] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
    try {
      setLoading(true);
      const [prodRes, userRes] = await Promise.all([
        api.get('/productos/'),
        api.get('/usuarios/')
      ]);
      
      // Extraer los arreglos de datos (manejando paginación o lista directa)
      const productosLista = prodRes.data.results ? prodRes.data.results : prodRes.data;
      const usuariosLista = userRes.data.results ? userRes.data.results : userRes.data;

      // Filtrar únicamente los que están activos
      const productosActivos = productosLista.filter((p: any) => p.estado === 'activo');
      // Nota: ajusta a 'is_active' o el campo que use tu backend para usuarios activos (ej: p.estado === 'activo' o u.is_active)
      const usuariosActivos = usuariosLista.filter((u: any) => u.is_active === true || u.estado === 'activo');

      setTotalProductos(productosActivos.length);
      setTotalUsuarios(usuariosActivos.length);
    } catch (err) {
      setError('Error al cargar las métricas del dashboard.');
    } finally {
      setLoading(false);
    }
  };

    fetchStats();
  }, []);

  return (
    <>
      <Navbar />
      <Container>
        <h2 className="mb-4">Dashboard Administrativo</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Cargando métricas...</p>
          </div>
        ) : (
          <>
            <Row className="mb-4">
              <Col md={6} className="mb-3">
                <Card className="text-white bg-primary shadow">
                  <Card.Body>
                    <Card.Title>Total de Productos</Card.Title>
                    <Card.Text className="display-4 font-weight-bold">{totalProductos}</Card.Text>
                    <Button variant="light" as={Link as any} to="/productos">
                      Gestionar Productos
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-3">
                <Card className="text-white bg-success shadow">
                  <Card.Body>
                    <Card.Title>Total de Usuarios</Card.Title>
                    <Card.Text className="display-4 font-weight-bold">{totalUsuarios}</Card.Text>
                    <Button variant="light" as={Link as any} to="/usuarios">
                      Gestionar Usuarios
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
};