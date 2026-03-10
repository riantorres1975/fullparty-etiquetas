from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import io
import random

# Librerías de impresión
from barcode import EAN13, Code128
from barcode.writer import ImageWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import mm
from PIL import Image as PILImage

# 1. BASE DE DATOS LOCAL (SQLite - No requiere instalación)
DATABASE_URL = "sqlite:///./inventario.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String)
    price = Column(Float)

Base.metadata.create_all(bind=engine)

# 2. CONFIGURACIÓN APP
app = FastAPI(title="Etiquetas Full Party")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

class ProductBase(BaseModel):
    sku: str
    name: str
    price: float

# 3. RUTAS BÁSICAS
@app.get("/products/")
def read_products(search: str = "", db: Session = Depends(get_db)):
    query = db.query(Product)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%"))
    
    #ORDENAR DEL MÁS NUEVO AL MÁS VIEJO
    return query.order_by(Product.id.desc()).all()

@app.post("/products/")
def save_product(product: ProductBase, db: Session = Depends(get_db)):
    db_prod = db.query(Product).filter(Product.sku == product.sku).first()
    if db_prod:
        db_prod.name = product.name
        db_prod.price = product.price
    else:
        db_prod = Product(**product.dict())
        db.add(db_prod)
    db.commit()
    return {"status": "ok"}

@app.delete("/products/{sku}")
def delete_product(sku: str, db: Session = Depends(get_db)):
    db.query(Product).filter(Product.sku == sku).delete()
    db.commit()
    return {"ok": True}

def ean13_checksum(d12: str):
    s = sum(int(ch) if i % 2 == 0 else 3 * int(ch) for i, ch in enumerate(d12))
    return str((10 - (s % 10)) % 10)

@app.get("/utils/sku/EAN13")
def generate_sku():
    rnd = ''.join(str(random.randint(0, 9)) for _ in range(12))
    return {"sku": rnd + ean13_checksum(rnd)}

# 4. IMPRESIÓN DIRECTA
@app.get("/print/label/{sku}")
def print_label(sku: str, store_name: str = "Full Party Uruapan", show_price: bool = True, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.sku == sku).first()
    if not prod: raise HTTPException(404, "No encontrado")
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=(62 * mm, 29 * mm))
    
    barcode_writer = ImageWriter()
    rv = io.BytesIO()
    opts = {"write_text": False, "module_height": 8.0, "quiet_zone": 1.0}
    
    if len(sku) == 13 and sku.isdigit(): EAN13(sku, writer=barcode_writer).write(rv, options=opts)
    else: Code128(sku, writer=barcode_writer).write(rv, options=opts)
    
    rv.seek(0)
    img = PILImage.open(rv)
    
    w, h = 62 * mm, 29 * mm
    c.setFont('Helvetica-Bold', 9)
    c.drawCentredString(w / 2.0, h - 5.0 * mm, store_name)
    
    iw, ih = img.size
    scale = min((w - 4*mm) / iw, (9*mm) / ih)
    new_w, new_h = iw * scale, ih * scale
    c.drawImage(ImageReader(img), (w - new_w) / 2.0, h - 15.5 * mm, width=new_w, height=new_h, mask='auto')
    
    c.setFont('Helvetica', 8)
    c.drawCentredString(w / 2.0, h - 18.5 * mm, sku)
    c.setFont('Helvetica', 7)
    c.drawCentredString(w / 2.0, h - 21.5 * mm, prod.name[:35])
    
    if show_price:
        c.setFont('Helvetica-Bold', 11)
        c.drawCentredString(w / 2.0, h - 25.0 * mm, f"$ {prod.price:,.2f}")

    c.showPage()
    c.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=etiqueta_{sku}.pdf"})

if __name__ == "__main__":
    import uvicorn
    import multiprocessing
    multiprocessing.freeze_support()
    uvicorn.run(app, host="127.0.0.1", port=8000)