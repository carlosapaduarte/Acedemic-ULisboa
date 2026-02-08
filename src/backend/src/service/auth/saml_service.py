import os
import json
from fastapi import Request
from onelogin.saml2.auth import OneLogin_Saml2_Auth

SAML_PATH = os.path.join(os.path.dirname(__file__), "../../certs")

def load_saml_settings():
    """Carrega as configurações do ficheiro settings.json e injeta os certificados."""
    settings_file_path = os.path.join(SAML_PATH, "settings.json")
    
    if not os.path.exists(settings_file_path):
        raise FileNotFoundError(f"SAML settings not found at {settings_file_path}")

    with open(settings_file_path, "r") as f:
        settings = json.load(f)

    app_base_url = os.getenv("APP_BASE_URL", "https://acedemic.studentlife.ulisboa.pt")

    # Carrega os certificados da pasta config/saml
    cert_path = os.path.join(SAML_PATH, "sp-certificate.pem")
    key_path = os.path.join(SAML_PATH, "sp-private-key.pem")

    with open(cert_path, "r") as cert:
        settings["sp"]["x509cert"] = cert.read().strip()

    with open(key_path, "r") as key:
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

    return {
        'https': 'on',
        'http_host': 'acedemic.studentlife.ulisboa.pt', 
        'script_name': path,
        'get_data': dict(request.query_params),
        'post_data': post_data
    }

async def init_saml_auth(request: Request) -> OneLogin_Saml2_Auth:
    """Inicializa a instância de autenticação SAML."""
    req_data = await prepare_request(request)
    settings = load_saml_settings()
    return OneLogin_Saml2_Auth(req_data, old_settings=settings)