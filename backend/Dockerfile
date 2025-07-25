# Gunakan base image Python resmi yang ringan
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIPENV_VENV_IN_PROJECT=1
ENV PYTHONPATH=/app/app

# Install system dependencies
RUN apt-get update \
  && apt-get install -y build-essential gcc curl libpq-dev \
  && apt-get clean

# Set working directory di dalam container
WORKDIR /app

# Copy file dependency terlebih dahulu (agar layer Docker bisa cache ini)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Salin semua source code
COPY . .

# Buka port aplikasi FastAPI (default Uvicorn)
EXPOSE 8000

# Jalankan aplikasi FastAPI menggunakan Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
