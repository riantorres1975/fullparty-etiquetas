#  Full Party Uruapan - Generador de Etiquetas

Aplicación de escritorio desarrollada a la medida para la gestión de inventario y la impresión rápida de etiquetas de precios y códigos de barras (EAN13 y Code128). Optimizada para impresoras térmicas Brother QL-800.

##  Características Principales

* **Interfaz Moderna y Temática:** Diseño responsivo utilizando Tailwind CSS con la paleta de colores oficial de la tienda.
* **Navegación Fluida (Sin Mouse):** Flujo de trabajo optimizado donde la tecla \Enter\ permite saltar entre campos, auto-generar SKUs y guardar productos rápidamente.
* **Calidad de Datos Automática:** El sistema estandariza automáticamente los nombres de los productos (ej. "gLoBos" -> "Globos") antes de guardarlos.
* **Gestión Segura de Inventario:** Ordenamiento cronológico (más recientes primero) y un sistema de "Smart Delete" (botón de confirmación temporal) que evita los bloqueos nativos de las ventanas de alerta en Electron.
* **Impresión Directa:** Generación de PDFs al vuelo ajustados a medidas de 62mm x 29mm.
* **Memoria Persistente:** Guarda las preferencias de impresión (mostrar precio, nombre de tienda) localmente.
* **Arquitectura Híbrida (MVC):** Backend ultraligero en Python (FastAPI + SQLite) empaquetado de forma invisible dentro de una ventana nativa de Electron, con vista, estilos y lógica separados.

##  Tecnologías Utilizadas

**Frontend (Vista):**
* Electron (Node.js)
* HTML5 / Vanilla JavaScript / CSS3
* Tailwind CSS

**Backend (Lógica y Base de Datos):**
* Python 3
* FastAPI / Uvicorn
* SQLite (SQLAlchemy)
* ReportLab / Python-Barcode

##  Instalación para Desarrollo

Si deseas modificar el código o hacer pruebas en tu entorno local, necesitas tener instalados Node.js y Python.

1. Clonar el repositorio:
   git clone https://github.com/TU_USUARIO/fullparty-etiquetas.git
   cd fullparty-etiquetas

2. Instalar dependencias del Frontend (Electron):
   npm install

3. Instalar dependencias del Backend (Python):
   pip install fastapi uvicorn sqlalchemy python-barcode reportlab Pillow pyinstaller

4. Iniciar la aplicación en modo desarrollo:
   npm start

##  Compilación (Crear el ejecutable .exe)

1. Compilar el backend de Python a un archivo ejecutable (Comando blindado):
   python -m PyInstaller --name servidor_etiquetas --onefile --clean --hidden-import=fastapi --hidden-import=uvicorn --hidden-import=pydantic --hidden-import=starlette --hidden-import=uvicorn.logging --hidden-import=uvicorn.loops.auto --hidden-import=uvicorn.protocols.http.auto --hidden-import=uvicorn.lifespan.on main.py

2. Empaquetar todo el sistema con Electron:
   npx electron-packager . FullPartyEtiquetas --platform=win32 --arch=x64 --overwrite --icon=logo.ico

##  Autor
Desarrollado por **Wh0am1**.
