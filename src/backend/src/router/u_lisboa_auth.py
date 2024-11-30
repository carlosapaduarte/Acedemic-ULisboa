from fastapi import APIRouter, FastAPI, Request, Response, HTTPException
from fastapi.responses import RedirectResponse
from onelogin.saml2.auth import OneLogin_Saml2_Auth
import json
import os

router = APIRouter(
    prefix="/lisbon",
)

def load_saml_settings():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Construct the absolute path to settings.json
    settings_file_path = os.path.abspath(os.path.join(script_dir, "..", "settings.json"))
    print(f"Loading settings from: {settings_file_path}")
    with open(settings_file_path, "r") as f:
        return json.load(f)

async def prepare_request(request: Request) -> object:
    url_data = request.url.components
    return {
        'https': 'on' if url_data.scheme == 'https' else 'off',
        'http_host': url_data.netloc,
        'script_name': url_data.path,
        'get_data': dict(request.query_params),
        'post_data': await request.form()
    }

def init_saml_auth(req: object) -> OneLogin_Saml2_Auth:
    settings = load_saml_settings()
    return OneLogin_Saml2_Auth(req, settings)

@router.get("/saml/login")
async def saml_login(request: Request):
    req = await prepare_request(request)
    print(req)
    auth = init_saml_auth(req)

    return RedirectResponse(auth.login())

@router.post("/saml/callback")
async def saml_callback(request: Request):
    req = await prepare_request(request)
    auth = init_saml_auth(req)
    auth.process_response()
    errors = auth.get_errors()
    if len(errors) > 0:
        raise HTTPException(status_code=400, detail=errors)
    if not auth.is_authenticated():
        raise HTTPException(status_code=401, detail="Authentication failed")
    user_data = {
        'username': auth.get_nameid(),
        'attributes': auth.get_attributes()
    }
    return user_data

@router.get("/saml/logout")
async def saml_logout(request: Request):
    req = await prepare_request(request)
    auth = init_saml_auth(req)
    return RedirectResponse(auth.logout())
