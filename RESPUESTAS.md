# Respuestas

## React / TypeScript

### 1. ¿Cuál es la diferencia entre props y state?

Las **props** son datos que un componente recibe desde su componente padre y normalmente son de solo lectura.

El **state** es información interna del componente que puede cambiar durante su ejecución y provocar que React vuelva a renderizarlo.

### 2. ¿Para qué sirve el hook useEffect y qué es su arreglo de dependencias?

`useEffect` permite ejecutar efectos secundarios, como hacer peticiones a una API, suscribirse a eventos o modificar elementos externos al componente.

Su arreglo de dependencias indica cuándo debe ejecutarse nuevamente. Por ejemplo:

```tsx
useEffect(() => {
  cargarDatos();
}, []);
```

Se ejecuta una sola vez al montar el componente.

### 3. En una lista renderizada con .map(), ¿por qué es importante la prop key?

`key` permite que React identifique de forma única cada elemento de una lista.

Esto ayuda a React a saber qué elementos cambiaron, se agregaron o eliminaron y así actualizar el DOM de manera más eficiente.

### 4. ¿Qué diferencia hay entre un componente controlado y uno no controlado al manejar formularios?

En un componente **controlado**, el valor del campo es manejado por el state de React mediante propiedades como `value` y `onChange`.

En uno **no controlado**, el valor queda principalmente administrado por el DOM y normalmente se obtiene mediante un `ref` cuando es necesario.

## Django / DRF

### 5. En Django REST Framework, explica con tus palabras qué hace un Serializer y qué hace un ViewSet.

Un **Serializer** transforma los datos entre objetos de Python/modelos y formatos como JSON, además de validar los datos recibidos.

Un **ViewSet** concentra la lógica de las operaciones de una API sobre un recurso, como listar, consultar, crear, actualizar o eliminar registros.

### 6. ¿Qué es una migración en Django y por qué no editamos la base de datos a mano?

Una migración es un archivo que describe los cambios realizados en los modelos de Django para aplicarlos de forma controlada a la base de datos.

Esto permite mantener el esquema sincronizado con el código y reproducir los mismos cambios en diferentes entornos sin modificar la base de datos manualmente.

### 7. ¿Cuál es la diferencia entre los métodos HTTP PUT y PATCH?

`PUT` normalmente se utiliza para reemplazar completamente un recurso, por lo que se espera recibir su representación completa.

`PATCH` permite modificar solamente algunos campos del recurso sin tener que enviar toda la información.

## Autenticación / JWT

### 8. Explica a grandes rasgos cómo funciona la autenticación con JWT.

Al iniciar sesión, el servidor valida las credenciales y devuelve un **JWT** que el cliente utiliza para identificarse en las siguientes peticiones.

El cliente lo almacena de forma segura y normalmente lo envía en el encabezado `Authorization: Bearer <token>`. No conviene guardar información sensible porque el contenido del JWT puede ser leído por quien tenga acceso al token.

## PostgreSQL / SQL

### 9. Consulta SQL

```sql
SELECT
    categoria,
    COUNT(*) AS cantidad_productos,
    SUM(stock) AS total_stock
FROM producto
WHERE estado = 'activo'
GROUP BY categoria
ORDER BY cantidad_productos DESC;
```

### 10. ¿Qué es un índice en una base de datos y por qué NO conviene ponerle índice a todas las columnas?

Un índice es una estructura que permite encontrar registros más rápidamente al realizar consultas, especialmente en columnas utilizadas frecuentemente en búsquedas, filtros o joins.

Sin embargo, los índices ocupan espacio y hacen más lentas algunas operaciones de `INSERT`, `UPDATE` y `DELETE`, por lo que deben utilizarse donde realmente aporten beneficio.

## Integración / general

### 11. ¿Cómo se comunica un frontend de React con una API REST?

React realiza peticiones HTTP a la API REST utilizando herramientas como `fetch` o `axios`, enviando y recibiendo normalmente datos en formato JSON.

**CORS** es un mecanismo de seguridad del navegador que controla las peticiones entre diferentes orígenes. Por eso aparece al conectar `localhost:5173` con `localhost:8000`, ya que son orígenes distintos y Django debe permitir explícitamente ese origen.