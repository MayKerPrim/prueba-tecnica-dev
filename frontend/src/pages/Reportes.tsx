import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Alert, Badge, Modal, Form } from 'react-bootstrap';
import { Navbar } from '../components/Navbar';
import api from '../services/api';
import type { Producto } from '../types';
import { generarReportePDF } from '../utils/pdfGenerator'; // <-- IMPORTAR LA FUNCIÓN EXTERNA

export const Reportes = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  // Estados para el Modal de PDF
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [categoriasSeleccionadasParaPdf, setCategoriasSeleccionadasParaPdf] = useState<{ [key: string]: boolean }>({});
  const [incluirStockBajo, setIncluirStockBajo] = useState<boolean>(true);
  const [incluirDetalleProductos, setIncluirDetalleProductos] = useState<boolean>(false);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/productos/');
      const data = res.data.results ? res.data.results : res.data;
      const productosActivos = data.filter((p: Producto) => p.estado === 'activo');
      setProductos(productosActivos);
    } catch (err) {
      setError('Error al cargar los datos para los reportes.');
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

  const categoriasUnicas = Array.from(new Set(productos.map(p => p.categoria)));
  const totalProductos = productos.length;
  const stockTotal = productos.reduce((acc, p) => acc + p.stock, 0);
  const valorInventarioTotal = productos.reduce((acc, p) => acc + (Number(p.precio) * p.stock), 0);

  const umbralStockBajo = 5;
  const productosStockBajo = productos.filter(p => p.stock <= umbralStockBajo && p.estado === 'activo');

  const categoriasMap = productos.reduce((acc: { [key: string]: { count: number; stock: number; valor: number } }, p) => {
    if (!acc[p.categoria]) {
      acc[p.categoria] = { count: 0, stock: 0, valor: 0 };
    }
    acc[p.categoria].count += 1;
    acc[p.categoria].stock += p.stock;
    acc[p.categoria].valor += Number(p.precio) * p.stock;
    return acc;
  }, {});

  const categoriasResumen = Object.keys(categoriasMap).map(cat => ({
    categoria: cat,
    ...categoriasMap[cat]
  }));

  const productosFiltrados = categoriaSeleccionada 
    ? productos.filter(p => p.categoria === categoriaSeleccionada) 
    : [];

  const handleToggleAllCategorias = (select: boolean) => {
    const updated: { [key: string]: boolean } = {};
    categoriasUnicas.forEach(cat => {
      updated[cat] = select;
    });
    setCategoriasSeleccionadasParaPdf(updated);
  };

  const handleToggleCategoria = (cat: string) => {
    setCategoriasSeleccionadasParaPdf(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Generador de Reporte PDF
  const handleGenerarPDF = () => {
    generarReportePDF({
      productos,
      categoriasSeleccionadasParaPdf,
      incluirStockBajo,
      incluirDetalleProductos,
      categoriasUnicas,
      categoriasResumen,
      productosStockBajo,
      formatMXN
    });
    setShowPdfModal(false);
  };

  return (
    <>
      <Navbar />
      <Container fluid="md">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Reportes y Analíticas de Inventario</h2>
          <Button variant="primary" onClick={() => setShowPdfModal(true)}>
            📥 Generar Reporte PDF
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Generando reportes...</p>
          </div>
        ) : (
          <>
            {/* Tarjetas de Resumen General */}
            <Row className="mb-4">
              <Col md={4} className="mb-3">
                <Card className="shadow-sm border-start border-primary border-4">
                  <Card.Body>
                    <h6 className="text-muted">Valor Total del Inventario</h6>
                    <h3 className="text-primary fw-bold">{formatMXN(valorInventarioTotal)}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="shadow-sm border-start border-success border-4">
                  <Card.Body>
                    <h6 className="text-muted">Stock Total de Unidades</h6>
                    <h3 className="text-success fw-bold">{stockTotal} pzas</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="shadow-sm border-start border-info border-4">
                  <Card.Body>
                    <h6 className="text-muted">Total de Productos Registrados</h6>
                    <h3 className="text-info fw-bold">{totalProductos}</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Alertas de Stock Bajo */}
            <Card className="shadow-sm mb-4 border-warning border-2">
              <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
                <h5 className="mb-0">⚠️ Alertas de Stock Bajo (≤ {umbralStockBajo} unidades)</h5>
                <Badge bg="dark">{productosStockBajo.length} productos en riesgo</Badge>
              </Card.Header>
              <Card.Body>
                {productosStockBajo.length === 0 ? (
                  <p className="text-success mb-0 text-center py-2">¡Excelente! No hay productos con stock crítico en este momento.</p>
                ) : (
                  <Table striped hover responsive size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock Actual</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosStockBajo.map((p) => (
                        <tr key={p.id}>
                          <td><strong>{p.nombre}</strong></td>
                          <td>{p.categoria}</td>
                          <td>{formatMXN(p.precio)}</td>
                          <td>
                            <Badge bg="danger" className="fs-6">{p.stock} pzas</Badge>
                          </td>
                          <td>
                            <Badge bg="success">{p.estado.toUpperCase()}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>

            {/* Resumen por Categorías */}
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Resumen por Categorías</h5>
                <small className="text-light">Haz clic en una categoría para ver el detalle</small>
              </Card.Header>
              <Card.Body>
                <Table hover responsive className="align-middle">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Variedad de Productos</th>
                      <th>Stock Acumulado</th>
                      <th>Valor en Inventario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriasResumen.map((cat, idx) => (
                      <tr 
                        key={idx} 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => setCategoriaSeleccionada(cat.categoria)}
                        className={categoriaSeleccionada === cat.categoria ? 'table-active' : ''}
                      >
                        <td><strong>{cat.categoria}</strong></td>
                        <td>{cat.count} productos</td>
                        <td>{cat.stock} unidades</td>
                        <td><strong>{formatMXN(cat.valor)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Vista Detallada de la Categoría Seleccionada */}
            {categoriaSeleccionada && (
              <Card className="shadow-sm border-primary mb-4">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Desglose de la Categoría: "{categoriaSeleccionada}"</h5>
                  <Button variant="danger" size="sm" onClick={() => setCategoriaSeleccionada(null)}>
                    Cerrar Detalle ✕
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltrados.map((p) => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td><strong>{p.nombre}</strong></td>
                          <td>{p.descripcion || <span className="text-muted">Sin descripción</span>}</td>
                          <td>{formatMXN(p.precio)}</td>
                          <td>{p.stock}</td>
                          <td>
                            <Badge bg={p.estado === 'activo' ? 'success' : 'secondary'}>
                              {p.estado.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}
          </>
        )}

        {/* Modal de Configuración de PDF */}
        <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title>Configurar Reporte en PDF</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <h6 className="fw-bold mb-3">Secciones opcionales del reporte:</h6>
              <Form.Check 
                type="switch"
                id="stock-bajo-switch"
                label="Incluir sección de Alertas de Stock Bajo"
                checked={incluirStockBajo}
                onChange={(e) => setIncluirStockBajo(e.target.checked)}
                className="mb-2"
              />
              <Form.Check 
                type="switch"
                id="detalle-prods-switch"
                label="Incluir vista detallada de productos por cada categoría seleccionada"
                checked={incluirDetalleProductos}
                onChange={(e) => setIncluirDetalleProductos(e.target.checked)}
                className="mb-4"
              />

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0">Seleccionar Categorías a Incluir:</h6>
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleToggleAllCategorias(true)}>
                    Seleccionar Todas
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-light rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Row>
                  {categoriasUnicas.map((cat, index) => (
                    <Col md={6} key={index} className="mb-2">
                      <Form.Check 
                        type="checkbox"
                        id={`cat-check-${index}`}
                        label={cat}
                        checked={!!categoriasSeleccionadasParaPdf[cat]}
                        onChange={() => handleToggleCategoria(cat)}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            {/* Validar si hay al menos una categoría seleccionada */}
            {Object.values(categoriasSeleccionadasParaPdf).every(val => !val) && (
              <span className="text-danger me-auto small">Debes seleccionar al menos una categoría.</span>
            )}

            <Button variant="secondary" onClick={() => setShowPdfModal(false)}>
              Cancelar
            </Button>
            
            <Button 
              variant="success" 
              onClick={handleGenerarPDF}
              disabled={Object.values(categoriasSeleccionadasParaPdf).every(val => !val)}
            >
              Descargar PDF
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </>
  );
};