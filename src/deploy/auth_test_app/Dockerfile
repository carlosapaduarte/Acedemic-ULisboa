# Usa uma imagem base de Python
FROM python:3.11-slim

# Define o diretório de trabalho dentro do contentor
WORKDIR /app

# Copia o ficheiro de dependências e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto dos ficheiros da aplicação
COPY . .

# Expõe a porta em que a aplicação vai correr
EXPOSE 8001

# Comando para iniciar a aplicação
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
