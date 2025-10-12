import os
from fastapi import APIRouter, Request, Depends
from sqlmodel import Session
from urllib.parse import urlparse
from fastapi.responses import Response, RedirectResponse, JSONResponse
from onelogin.saml2.auth import OneLogin_Saml2_Auth

from config.saml_settings import SAML_SETTINGS
from repository.sql.models.database import get_session
from service.common import common as common_service
from service.common.security import create_access_token

router = APIRouter(
    prefix="/saml",
    tags=["SAML"],
)

async def init_saml_auth(request: Request) -> OneLogin_Saml2_Auth:
    """
    Função auxiliar para preparar o objeto de autenticação SAML para cada pedido
    """
    req = await request.json() if request.method == 'POST' else {
        "http_host": urlparse(str(request.url)).netloc,
        "script_name": request.url.path,
        "server_port": urlparse(str(request.url)).port or 80,
        "get_data": request.query_params,
        "post_data": await request.form()
    }
    return OneLogin_Saml2_Auth(req, old_settings=SAML_SETTINGS)

@router.get("/metadata", response_class=Response)
async def get_metadata(auth: OneLogin_Saml2_Auth = Depends(init_saml_auth)):
    """
    Endpoint que devolve o XML da metadata da aplicação 
    """
    settings = auth.get_settings()
    metadata = settings.get_sp_metadata()
    errors = settings.validate_metadata(metadata)

    if len(errors) == 0:
        return Response(content=metadata, media_type="application/xml")
    else:
        return JSONResponse(content={'errors': errors}, status_code=500)

@router.get("/auth")
async def start_saml_login(auth: OneLogin_Saml2_Auth = Depends(init_saml_auth)):
    """
    Endpoint que inicia o processo de login/redireciona o utilizador para a página de login da ULisboa
    """
    return_to_url = "http://localhost:5273/tracker" #TODO: mudar para ser o URL em produção <--
    return RedirectResponse(auth.login(return_to=return_to_url))

@router.post("/acs")
async def process_saml_assertion(request: Request, db: Session = Depends(get_session)):
    """
    endpoint que recebe a resposta da ULisboa depois do login
    """
    req = {
        "http_host": urlparse(str(request.url)).netloc,
        "script_name": request.url.path,
        "server_port": urlparse(str(request.url)).port or 80,
        "get_data": request.query_params,
        "post_data": await request.form()
    }
    auth = OneLogin_Saml2_Auth(req, old_settings=SAML_SETTINGS)
    
    auth.process_response()
    errors = auth.get_errors()

    if errors:
        print("Erros na resposta SAML:", auth.get_last_error_reason())
        return JSONResponse(content={'errors': errors}, status_code=401)

    if not auth.is_authenticated():
        return JSONResponse(content={'error': 'Not authenticated'}, status_code=401)
            
    attributes = auth.get_attributes()
    print("Atributos recebidos da ULisboa:", attributes)
    
    # ver no print oq vem (ex: mail, emailAddress ...)
    user_email = attributes.get('urn:oid:0.9.2342.19200300.100.1.3', [None])[0] 

    if not user_email:
        return JSONResponse(content={'error': 'Email não encontrado nos atributos SAML'}, status_code=400)

    # 1.procurar o user na bd pelo email
    user = common_service.get_user_by_username(db, user_email)

    #se não existir, cria um novo utilizador
    if not user:
        print(f"Utilizador '{user_email}' não encontrado. A criar novo utilizador...")
        #TODO: criar um função para criar um user só com o email.
        # deverá ser tipo:
        # new_user = common_service.create_user_from_saml(db, user_email, attributes)
        # user = new_user
        return JSONResponse(content={'error': 'User not found, auto-registration not implemented'}, status_code=404)


    #3.criar o token de sessão (JWT) para o frontend
    access_token = create_access_token(data={"sub": user.username})

    #4. redireciona o user para o frontend com o token
    #TODO: ver se o frontend é capaz de ler o token do URL e guardá-lo
    redirect_url = auth.get_redirect_to() or "http://localhost:5273/tracker" # URL de fallback
    
    final_url = f"{redirect_url}?token={access_token}"
    
    return RedirectResponse(final_url)