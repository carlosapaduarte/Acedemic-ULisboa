from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, FileResponse, JSONResponse, Response
from onelogin.saml2.auth import OneLogin_Saml2_Auth
import json
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do ficheiro .env
load_dotenv()

app = FastAPI()

def load_saml_settings():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    settings_file_path = os.path.join(script_dir, "settings.json")
    
    with open(settings_file_path, "r") as f:
        settings = json.load(f)

    app_base_url = os.getenv("APP_BASE_URL")

    # Carrega certificado e chave reais (os teus)
    with open("sp-certificate.pem", "r") as cert:
        settings["sp"]["x509cert"] = cert.read().strip()

    with open("sp-private-key.pem", "r") as key:
        settings["sp"]["privateKey"] = key.read().strip()

    settings_str = json.dumps(settings)
    settings_str = settings_str.replace("PLACEHOLDER_URL", app_base_url)

    return json.loads(settings_str)


async def prepare_request(request: Request) -> dict:
    """Prepara o objeto de pedido para a biblioteca python3-saml."""
    post_data = {}
    if request.method == 'POST':
      try:
        post_data = dict(await request.form())
      except Exception:
        pass

    path = request.url.path
    if not path.startswith("/auth-test"):
        path = "/auth-test" + path

    return {
        'https': 'on',
        'http_host': 'acedemic.studentlife.ulisboa.pt', # Forçamos o domínio correto para garantir
        'script_name': path,
        'get_data': dict(request.query_params),
        'post_data': post_data
    }

def init_saml_auth(req: dict) -> OneLogin_Saml2_Auth:
    """Inicializa a instância de autenticação SAML."""
    settings = load_saml_settings()
    return OneLogin_Saml2_Auth(req, old_settings=settings)

@app.get("/", response_class=FileResponse, summary="Página de Teste")
async def read_root():
    """Serve a página HTML principal com o botão de login."""
    return "index.html"

@app.get("/lisbon/saml/login", summary="Iniciar Login SAML")
async def saml_login(request: Request):
    """Redireciona o utilizador para a página de login da ULisboa."""
    try:
        req = await prepare_request(request)
        auth = init_saml_auth(req)
        return RedirectResponse(auth.login())
    except Exception as e:
        print(f"ERRO ao iniciar o login: {e}")
        raise HTTPException(status_code=500, detail="Erro ao preparar o pedido de autenticação.")

@app.post("/lisbon/saml/callback", summary="Callback SAML")
async def saml_callback(request: Request):
    """Recebe a resposta da ULisboa após o login."""
    try:
        req = await prepare_request(request)
        auth = init_saml_auth(req)
        auth.process_response()
        
        errors = auth.get_errors()
        if errors:
            print("Erros SAML recebidos:", auth.get_last_error_reason())
            raise HTTPException(status_code=400, detail=f"Erro no processo SAML: {', '.join(errors)}")
            
        if not auth.is_authenticated():
            raise HTTPException(status_code=401, detail="Authentication failed")
        
        user_data = {
            'username': auth.get_nameid(),
            'attributes': auth.get_attributes()
        }
        return JSONResponse(content={"message": "Login bem-sucedido!", "data": user_data})
    except Exception as e:
        print(f"ERRO no callback: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a resposta de autenticação.")

@app.get("/lisbon/saml/metadata", summary="Metadados do SP")
async def saml_metadata(request: Request):
  """Fornece os metadados do Service Provider (a nossa aplicação)."""
  try:
    req = await prepare_request(request)
    auth = init_saml_auth(req) 
    settings = auth.get_settings()
    metadata = settings.get_sp_metadata()
    errors = settings.validate_metadata(metadata)
    if len(errors) == 0:
      return Response(content=metadata, media_type="application/xml")
    else:
      print(f"ERRO ao validar metadados: {', '.join(errors)}")
      raise HTTPException(status_code=500, detail=f"Erro ao gerar metadados: {', '.join(errors)}")
  except Exception as e:
    print(f"ERRO ao gerar metadados: {e}")
    raise HTTPException(status_code=500, detail="Erro interno ao gerar metadados.")