import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Producto } from '../types';

interface GenerarPdfOptions {
  productos: Producto[];
  categoriasSeleccionadasParaPdf: { [key: string]: boolean };
  incluirStockBajo: boolean;
  incluirDetalleProductos: boolean;
  categoriasUnicas: string[];
  categoriasResumen: Array<{ categoria: string; count: number; stock: number; valor: number }>;
  productosStockBajo: Producto[];
  formatMXN: (amount: number | string) => string;
}

export const generarReportePDF = ({
  productos,
  categoriasSeleccionadasParaPdf,
  incluirStockBajo,
  incluirDetalleProductos,
  categoriasUnicas,
  categoriasResumen,
  productosStockBajo,
  formatMXN
}: GenerarPdfOptions) => {
  const doc = new jsPDF();
  let currentY = 20;

  // Filtrar categorías seleccionadas en el modal
  const catsSeleccionadasNames = Object.keys(categoriasSeleccionadasParaPdf).filter(
    cat => categoriasSeleccionadasParaPdf[cat]
  );

  // Validación de seguridad por si acaso
  if (catsSeleccionadasNames.length === 0) {
    alert("Debes seleccionar al menos una categoría para generar el reporte.");
    return;
  }

  // 1. ENCABEZADO CORPORATIVO
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text("SISTEMA DE CONTROL DE INVENTARIOS", 14, currentY);
  
  currentY += 6;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const usuarioActual = localStorage.getItem('username') || 'Administrador';
  doc.text(`Reporte Ejecutivo generado por: ${usuarioActual} | Fecha: ${new Date().toLocaleString()}`, 14, currentY);

  currentY += 12;

  // 2. VISTA GENERAL (De las categorías seleccionadas)
  const productosDeCatsSeleccionadas = productos.filter(p => catsSeleccionadasNames.includes(p.categoria));
  const valTotalSel = productosDeCatsSeleccionadas.reduce((acc, p) => acc + (Number(p.precio) * p.stock), 0);
  const stockTotalSel = productosDeCatsSeleccionadas.reduce((acc, p) => acc + p.stock, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(13, 110, 253);
  doc.text("Resumen General", 14, currentY);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    head: [['Valor Total Inventario', 'Stock Acumulado', 'Categorías Incluidas']],
    body: [[
      formatMXN(valTotalSel),
      `${stockTotalSel} unidades`,
      `${catsSeleccionadasNames.length} de ${categoriasUnicas.length}`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [13, 110, 253] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // 3. SECCIÓN DE STOCK BAJO (Filtrado ÚNICAMENTE por las categorías seleccionadas)
  if (incluirStockBajo) {
    // Filtramos el stock bajo que pertenezca a las categorías seleccionadas
    const stockBajoFiltrado = productosStockBajo.filter(p => catsSeleccionadasNames.includes(p.categoria));

    if (stockBajoFiltrado.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(217, 83, 79);
      doc.text("Alertas de Stock Crítico (<= 5 unidades)", 14, currentY);
      currentY += 6;

      const stockBajoData = stockBajoFiltrado.map(p => [
        p.nombre,
        p.categoria,
        formatMXN(p.precio),
        `${p.stock} pzas`,
        p.estado.toUpperCase()
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Producto', 'Categoría', 'Precio', 'Stock', 'Estado']],
        body: stockBajoData,
        theme: 'striped',
        headStyles: { fillColor: [217, 83, 79] }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // 4. RESUMEN DE LAS CATEGORÍAS SELECCIONADAS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(33, 37, 41);
  doc.text("Desglose por Categorías", 14, currentY);
  currentY += 6;

  const resumenData = categoriasResumen
    .filter(c => catsSeleccionadasNames.includes(c.categoria))
    .map(c => [
      c.categoria,
      `${c.count} prod.`,
      `${c.stock} pzas`,
      formatMXN(c.valor)
    ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Categoría', 'Variedad', 'Stock Total', 'Valor Inventario']],
    body: resumenData,
    theme: 'grid',
    headStyles: { fillColor: [52, 58, 64] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // 5. VISTA DETALLADA DE PRODUCTOS (Si el usuario activó la opción)
  if (incluirDetalleProductos) {
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 37, 41);
    doc.text("Listado Detallado de Productos por Categoría", 14, currentY);
    currentY += 6;

    catsSeleccionadasNames.forEach(catName => {
      const prodsCat = productos.filter(p => p.categoria === catName);
      if (prodsCat.length === 0) return;

      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(13, 110, 253);
      doc.text(`Categoría: ${catName}`, 14, currentY);
      currentY += 5;

      const detalleData = prodsCat.map(p => [
        p.nombre,
        p.descripcion || 'Sin descripción',
        formatMXN(p.precio),
        p.stock.toString(),
        p.estado.toUpperCase()
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Nombre', 'Descripción', 'Precio', 'Stock', 'Estado']],
        body: detalleData,
        theme: 'grid',
        headStyles: { fillColor: [108, 117, 125] },
        styles: { fontSize: 9 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    });
  }

  // Guardar el documento PDF generado
  doc.save(`reporte-inventario-${new Date().toISOString().slice(0, 10)}.pdf`);
};