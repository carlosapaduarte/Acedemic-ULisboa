import os
from dotenv import load_dotenv

#carrega as var do .env
load_dotenv()

try:
    with open('sp.crt', 'r') as f:
        SP_CERT = f.read()
except FileNotFoundError:
    SP_CERT = ""

#lê a chave privada
SP_PRIVATE_KEY = os.getenv("SAML_SP_PRIVATE_KEY", "")

BASE_URL = "https://acedemic.studentlife.ulisboa.pt"

SAML_SETTINGS = {
    "strict": True,
    "debug": True,  #Mudar para False em produção

    # ============Configuração do Service Provider======================================================

    "sp": {
        #isto vai ser o URL da metadata
        "entityId": f"{BASE_URL}/api/saml/metadata",
        
        "assertionConsumerService": {
            "url": f"{BASE_URL}/api/saml/acs",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        },
        
        #endpoint para o logout para usar depois
        "singleLogoutService": {
            "url": f"{BASE_URL}/api/saml/slo",
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        },
        
        "NameIDFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
        
        #o certificado público e chave privada que foram criados
        "x509cert": SP_CERT,
        "privateKey": SP_PRIVATE_KEY
    },

    # ======================Configuração do identity provider (ULISBOA)============================================
    "idp": {
        "entityId": "https://id.ulisboa.pt/nidp/saml2/metadata", 
        
        # os users sao redirecionados para este url
        "singleSignOnService": {
            "url": "https://id.ulisboa.pt/nidp/saml2/sso", 
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        },
        
        #url de logout
        "singleLogoutService": {
            "url": "https://id.ulisboa.pt/nidp/saml2/slo", 
            "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        },
        
        #certificado público da ULisboa para verificar a assinatura deles
        "x509cert": "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" 
    }
}