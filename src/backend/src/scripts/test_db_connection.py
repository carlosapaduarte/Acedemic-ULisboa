import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Carregar variáveis do .env
load_dotenv()

# Buscar URL da base de dados
DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL")

# Criar engine
try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("✅ Ligação à base de dados estabelecida com sucesso!")
except Exception as e:
    print("❌ Erro ao ligar à base de dados:")
    print(e)