FROM python:3.12-slim

RUN apt-get update -qq && apt-get install -y -qq \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}
