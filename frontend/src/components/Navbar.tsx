import { useState, useEffect } from 'react';
import { Navbar as BsNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, NavLink } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Usuario');

  useEffect(() => {
    const updateUsername = () => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };

    updateUsername();

    window.addEventListener('newUsername', updateUsername);
    return () => window.removeEventListener('newUsername', updateUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <BsNavbar.Brand className="fw-bold text-info">
          Bienvenido, {username}
        </BsNavbar.Brand>
        
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/dashboard" className={({ isActive }) => isActive ? "fw-bold text-white active" : "text-light"}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={NavLink} to="/productos" className={({ isActive }) => isActive ? "fw-bold text-white active" : "text-light"}>
              Productos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/usuarios" className={({ isActive }) => isActive ? "fw-bold text-white active" : "text-light"}>
              Usuarios
            </Nav.Link>
            <Nav.Link as={NavLink} to="/reportes" className={({ isActive }) => isActive ? "fw-bold text-white active" : "text-light"}>
              Reportes
            </Nav.Link>
          </Nav>
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};