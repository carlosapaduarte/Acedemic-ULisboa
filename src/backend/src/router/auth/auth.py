from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta
import os
from repository.sql.models.database import get_session
from service.auth.saml_service import init_saml_auth
from repository.sql.commons.repo_sql import CommonsSqlRepo
from service.common.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from service.gamification import core as gamification_service

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.get("/login", summary="Iniciar Login ULisboa (SAML)")
async def saml_login(request: Request):
    """Redireciona para o Identity Provider da ULisboa."""
    try:
        auth = await init_saml_auth(request)
        # O return_to diz ao Fenix para onde voltar (o nosso callback)
        callback_url = str(request.url_for('saml_callback'))
        return RedirectResponse(auth.login(return_to=callback_url))
    except Exception as e:
        print(f"Erro SAML Login: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao iniciar autenticação SAML")

@router.post("/callback", summary="Callback do Login ULisboa")
async def saml_callback(request: Request, db: Session = Depends(get_session)):
    """Processa a resposta do Fénix, cria user se necessário e devolve Token."""
    try:
        auth = await init_saml_auth(request)
        auth.process_response()
        
        errors = auth.get_errors()
        if errors:
            raise HTTPException(status_code=400, detail=f"Erro SAML: {', '.join(errors)}")

        if not auth.is_authenticated():
            raise HTTPException(status_code=401, detail="Não autenticado")

        # 1. Extrair dados do XML do SAML
        attributes = auth.get_attributes()
        # O uniqueID é o identificador chave (ex: B92923CC-...)
        fenix_id = attributes.get('uniqueID', [None])[0]
        # O mail vem como lista (ex: ['fc12345@alunos...'])
        email = attributes.get('mail', [None])[0]
        
        if not fenix_id:
            raise HTTPException(status_code=400, detail="ID Fénix não encontrado na resposta")

        # 2. Verificar se o utilizador já existe na BD
        user = CommonsSqlRepo.get_user_by_fenix_id(db, fenix_id)

        if not user:
            # === REGISTO DE NOVO UTILIZADOR ===
            # Tenta extrair o username do email (ex: fc12345) ou usa o fenix_id
            username = email.split('@')[0] if email else fenix_id
            
            # Garantir que o username é único (se já existir um fc12345 manual, adicionamos sufixo)
            if CommonsSqlRepo.exists_user_by_username(db, username):
                username = f"{username}_sso"

            new_user_model = CommonsSqlRepo.create_user_from_saml(db, username, fenix_id, email)
            
            gamification_service._get_or_create_user_metrics(db, new_user_model.id)
            
            user = CommonsSqlRepo.get_user_by_id(db, new_user_model.id)

        # 3. Gerar o Token JWT (Igual ao login normal)
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )

        # 4. REDIRECIONAR PARA O FRONTEND
        frontend_url = os.getenv("FRONTEND_URL", "https://acedemic.studentlife.ulisboa.pt")
        
        redirect_url = f"{frontend_url}/sso-callback?token={access_token}&username={user.username}"
        
        return RedirectResponse(url=redirect_url, status_code=303)

    except Exception as e:
        print(f"Erro no Callback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))