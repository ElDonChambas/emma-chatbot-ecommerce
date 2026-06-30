# Usamos una imagen oficial de Python ligera
FROM python:3.10-slim

# Creamos un directorio de trabajo en el servidor
WORKDIR /code

# Copiamos tu lista de dependencias y las instalamos
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copiamos el resto de tu código (tu voz-server.py)
COPY . .

# Exponemos el puerto estricto que exige Hugging Face
EXPOSE 7860

# Comando para encender FastAPI
CMD ["uvicorn", "voz_server:app", "--host", "0.0.0.0", "--port", "7860"]