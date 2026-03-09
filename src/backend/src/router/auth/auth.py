from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.responses import RedirectResponse, Response
from sqlalchemy.orm import Session
from datetime import timedelta
import os
import datetime
import re

from repository.sql.models.database import get_session
from service.auth.saml_service import init_saml_auth, prepare_request
from repository.sql.commons.repo_sql import CommonsSqlRepo
from service.common.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from service.gamification import core as gamification_service

router = APIRouter(
    prefix="/auth/ulisboa",
    tags=["Authentication"]
)

@router.get("/login", summary="Iniciar Login ULisboa (SAML)")
async def saml_login(request: Request, target: str = "tracker"):
    try:
        auth = await init_saml_auth(request)
        return RedirectResponse(auth.login(return_to=target))
    except Exception as e:
        print(f"Erro SAML Login: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao iniciar autenticação SAML")

@router.post("/callback", summary="Callback do Login ULisboa")
async def saml_callback(request: Request, db: Session = Depends(get_session)):
    try:
        req = await prepare_request(request)
        auth = await init_saml_auth(request)
        auth.process_response()
        
        errors = auth.get_errors()
        if errors:
            raise HTTPException(status_code=400, detail=f"Erro SAML: {', '.join(errors)}")

        if not auth.is_authenticated():
            raise HTTPException(status_code=401, detail="Não autenticado")

        attributes = auth.get_attributes()
        fenix_id = attributes.get('uniqueID', [None])[0]
        email = attributes.get('mail', [None])[0]
        
        if not fenix_id:
            raise HTTPException(status_code=400, detail="ID Fénix não encontrado")

        # ==========================================================
        # 🚨 WHITELIST
        # ==========================================================
        target_app = req['post_data'].get('RelayState', 'tracker')

        try:
            from router.auth.whitelist import TRACKER_ALLOWED, CHALLENGE_ALLOWED
        except ImportError:
            TRACKER_ALLOWED = set()
            CHALLENGE_ALLOWED = set()

        safe_email = email.lower() if email else ""

        is_allowed = False
        if target_app == 'tracker' and safe_email in TRACKER_ALLOWED:
            is_allowed = True
        elif target_app == 'challenge' and safe_email in CHALLENGE_ALLOWED:
            is_allowed = True

        if not is_allowed:
            print(f"⚠️ BLOQUEADO: {safe_email} para o {target_app}")
            frontend_url = os.getenv("FRONTEND_URL", "https://acedemic.studentlife.ulisboa.pt")
            if target_app == 'tracker':
                redirect_url = f"{frontend_url}/tracker/tracker-reservado"
            else:
                redirect_url = f"{frontend_url}/challenge/challenge-reservado"
            return RedirectResponse(url=redirect_url, status_code=303)
        # ==========================================================

        user = CommonsSqlRepo.get_user_by_fenix_id(db, fenix_id)
        is_new_user = False

        if not user:
            is_new_user = True
            username = email.split('@')[0] if email else fenix_id
            if CommonsSqlRepo.exists_user_by_username(db, username):
                username = f"{username}_sso"
            new_user_model = CommonsSqlRepo.create_user_from_saml(db, username, fenix_id, email)
            gamification_service._get_or_create_user_metrics(db, new_user_model.id)
            user = CommonsSqlRepo.get_user_by_id(db, new_user_model.id)

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        frontend_url = os.getenv("FRONTEND_URL", "https://acedemic.studentlife.ulisboa.pt")
        redirect_url = f"{frontend_url}/sso-callback?token={access_token}&username={user.username}&target={target_app}&new={str(is_new_user).lower()}"
        
        return RedirectResponse(url=redirect_url, status_code=303)

    except Exception as e:
        print(f"Erro no Callback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metadata")
async def metadata(request: Request):
    try:
        req = await prepare_request(request)
        auth = await init_saml_auth(request)
        settings = auth.get_settings()
        metadata = settings.get_sp_metadata()
        errors = settings.validate_metadata(metadata)
        
        if len(errors) == 0:
            now = datetime.datetime.utcnow()
            valid_until = (now + datetime.timedelta(days=365)).strftime('%Y-%m-%dT%H:%M:%SZ')
            metadata_str = metadata if isinstance(metadata, str) else metadata.decode('utf-8')
            metadata_str = re.sub(r'validUntil="[^"]+"', f'validUntil="{valid_until}"', metadata_str)
            return Response(content=metadata_str, media_type="application/xml")
        else:
            raise HTTPException(status_code=500, detail=", ".join(errors))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))