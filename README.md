# 🏷️ Full Party Uruapan - Generador de Etiquetas

Aplicación de escritorio desarrollada a la medida para la gestión de inventario y la impresión rápida de etiquetas de precios y códigos de barras (EAN13 y Code128). Optimizada para impresoras térmicas Brother QL-800.

## ✨ Características

* **Interfaz Moderna:** Diseño responsivo utilizando Tailwind CSS con la paleta de colores oficial de la tienda.
* **Gestión de Inventario:** Creación, edición y eliminación de productos con control de stock (alertas visuales por bajo inventario).
* **Generación Automática de SKU:** Creación de códigos EAN13 con un solo clic.
* **Impresión Directa:** Generación de PDFs al vuelo ajustados a medidas de 62mm x 29mm.
* **Memoria Persistente:** Guarda las preferencias de impresión (mostrar precio, nombre de tienda) localmente.
* **Arquitectura Híbrida:** Backend ultraligero en Python (FastAPI + SQLite) empaquetado de forma invisible dentro de una ventana nativa de Electron.

## 🛠️ Tecnologías Utilizadas

**Frontend (Vista):**
* Electron (Node.js)
* HTML5 / Vanilla JavaScript
* Tailwind CSS

**Backend (Lógica y Base de Datos):**
* Python 3
* FastAPI / Uvicorn
* SQLite (SQLAlchemy)
* ReportLab / Python-Barcode

## 🚀 Instalación para Desarrollo

Si deseas modificar el código o hacer pruebas en tu entorno local, necesitas tener instalados Node.js y Python.

1. Clonar el repositorio:
   git clone https://github.com/TU_USUARIO/fullparty-etiquetas.git
   cd fullparty-etiquetas

2. Instalar dependencias del Frontend (Electron):
   npm install

3. Instalar dependencias del Backend (Python):
   pip install fastapi uvicorn sqlalchemy python-barcode reportlab Pillow

4. Iniciar la aplicación en modo desarrollo:
   npm start

## 📦 Compilación (Crear el ejecutable .exe)

Para compilar la aplicación y usarla en producción en la caja de la tienda sin necesidad de consolas:

1. Compilar el backend de Python a un archivo ejecutable:
   pyinstaller --name servidor_etiquetas --onefile main.py

2. Empaquetar todo el sistema con Electron:
   npx electron-packager . FullPartyEtiquetas --platform=win32 --arch=x64 --overwrite --icon=logo.ico

## 👨‍💻 Autor
Desarrollado por **Wh0am1**.
