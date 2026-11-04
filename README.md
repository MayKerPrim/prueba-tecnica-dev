# Catálogo de Productos

Plataforma web para administrar un catálogo de productos.

## Tecnologías

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- JWT

### Frontend

- React
- TypeScript
- Vite
- Bootstrap
- jsPDF

## Requisitos

- Python 3.10+
- Node.js 18+
- npm
- PostgreSQL
- Git

## Instalación

### 1. Clonar el repositorio

```
git clone https://github.com/MayKerPrim/prueba-tecnica-dev.git
cd prueba-tecnica-dev
```

### 2. Backend

```
cd backend
python -m venv venv
```

Si es Windows, utilizar:

```powershell
.\venv\Scripts\activate
```

Si tiene macOS/Linux, utilizar:

```powershell
source venv/bin/activate
```

Luego:

```powershell
pip install -r requirements.txt
```

Crear `.env` a partir de `.env.example`.

## Base de datos

Crear una base de datos PostgreSQL llamada `catalogo-db`.

Configurar las credenciales en `.env`.

Ejecutar:

```
python manage.py makemigrations
python manage.py migrate
```

## Frontend

```
cd ../frontend
npm install
```

Crear `.env` a partir de `.env.example`.

## Ejecución

### Backend

```
cd backend
python manage.py runserver
```

API disponible en:  
http://localhost:8000

### Frontend

```
cd frontend
npm run dev
```

Aplicación disponible en:  
http://localhost:5173

## Despliegue a producción

#### Despliegue del Backend (Ej. Render, Railway o PythonAnywhere)

1. Subir tu código backend a un repositorio de GitHub.

2. Configurar las variables de entorno en la plataforma de hosting.

3. Asegúrarse de que el comando de compilación o despliegue ejecute las migraciones automáticamente:

```bash
python manage.py migrate
```

4. Desplegar el backend y obtén la URL base de la API, por ejemplo:

`https://tu-api.onrender.com`

#### Despliegue del Frontend (Ej. Vercel, Netlify o GitHub Pages)

1. Configurar la URL base de la API mediante las variables de entorno del frontend.

En plataformas como Vercel o Netlify, esta variable puede configurarse directamente desde el panel de configuración del proyecto.

2. Instalar las dependencias y genera el paquete optimizado para producción:

```bash
npm install
npm run build
```

3. Subir la carpeta generada (`dist`) al proveedor de hosting estático. Vercel y Netlify pueden encargarse automáticamente de este proceso al conectar el repositorio de GitHub.
