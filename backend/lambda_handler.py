# Handler de AWS Lambda: adapta la app FastAPI para ejecutarse en Lambda con Mangum

from mangum import Mangum
from app.main import app

handler = Mangum(app)