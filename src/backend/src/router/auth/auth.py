from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, Response
from sqlalchemy.orm import Session
from datetime import timedelta
import os
from repository.sql.models.database import predefined_global_tag_names
from repository.sql.models.database import get_session
from service.auth.saml_service import init_saml_auth, prepare_request
from repository.sql.commons.repo_sql import CommonsSqlRepo
from service.common.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from service.gamification import core as gamification_service
from repository.sql.models.models import TagModel, UserTagLink, UserModel

router = APIRouter(
    prefix="/auth/ulisboa",
    tags=["Authentication"]
)

@router.get("/login", summary="Iniciar Login ULisboa (SAML)")
async def saml_login(request: Request, target: str = "tracker"):
    if target not in {"tracker", "challenge"}:
        raise HTTPException(status_code=400, detail="Destino de aplicação inválido")
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
        print("💡 Atributos recebidos da ULisboa:", attributes)
        
        fenix_id = attributes.get('uniqueID', [None])[0]
        email = attributes.get('mail', [None])[0]
        
        if not fenix_id:
            raise HTTPException(status_code=400, detail="ID Fénix não encontrado")

        requested_target = req['post_data'].get('RelayState', 'tracker')
        target_app = (
            requested_target
            if requested_target in {"tracker", "challenge"}
            else "tracker"
        )

        user = CommonsSqlRepo.get_user_by_fenix_id(db, fenix_id)
        is_new_user = False

        # EXTRAÇÃO DO PRIMEIRO E ÚLTIMO NOME (SAML ULISBOA)
        raw_full_name = attributes.get('fullName', [None])[0] or attributes.get('displayName', [None])[0] or attributes.get('cn', [None])[0]
        real_name = None
        if raw_full_name:
            name_parts = raw_full_name.strip().split()
            real_name = f"{name_parts[0]} {name_parts[-1]}" if len(name_parts) > 1 else name_parts[0]

        if not user:
            is_new_user = True
            username = email.split('@')[0] if email else fenix_id
            if CommonsSqlRepo.exists_user_by_username(db, username):
                username = f"{username}_sso"
            
            new_user_model = CommonsSqlRepo.create_user_from_saml(db, username, fenix_id, email)
            gamification_service._get_or_create_user_metrics(db, new_user_model.id)
            user = CommonsSqlRepo.get_user_by_id(db, new_user_model.id)
            
            if real_name:
                user_db = db.get(UserModel, user.id)
                if user_db:
                    user_db.display_name = real_name
                    db.add(user_db)
                    db.commit()

            # Tags Predefinidas
            try:
                for tag_data in predefined_global_tag_names:
                    new_tag = TagModel(name_pt=tag_data.get("name_pt"), name_en=tag_data.get("name_en"), color=tag_data.get("color"), is_uc=False, is_global=False)
                    db.add(new_tag)
                    db.flush() 
                    link = UserTagLink(user_id=user.id, tag_id=new_tag.id, is_custom=False)
                    db.add(link)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"Erro tags: {e}")
                
        else:
            # Atualização para user existente
            if real_name and getattr(user, 'display_name', None) != real_name:
                user_db = db.get(UserModel, user.id)
                if user_db:
                    user_db.display_name = real_name
                    db.add(user_db)
                    db.commit()

        try:
            gamification_service.update_login_streak(db, user.id)
        except: pass

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
        
        name_to_show = getattr(user, 'display_name', None) or user.username
        frontend_url = os.getenv("FRONTEND_URL", "https://acedemic.studentlife.ulisboa.pt").rstrip('/')
        redirect_url = f"{frontend_url}/{target_app}/sso-callback?token={access_token}&username={name_to_show}&target={target_app}&new={str(is_new_user).lower()}"
        
        return RedirectResponse(url=redirect_url, status_code=303)

    except Exception as e:
        print(f"Erro no Callback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metadata")
async def metadata(request: Request):
    try:
        auth = await init_saml_auth(request)
        settings = auth.get_settings()
        metadata = settings.get_sp_metadata()
        return Response(content=metadata, media_type="application/xml")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

