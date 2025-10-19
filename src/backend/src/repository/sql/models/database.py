import os
from typing import Generator
from dotenv import load_dotenv
from sqlmodel import Session, create_engine, SQLModel, select
import logging
from repository.sql.models.models import TagModel, Badge, League

load_dotenv()

logger = logging.getLogger(__name__)

# Configuração da bd
DATABASE_URL = os.environ.get("SQLALCHEMY_DATABASE_URL")
print("url bd:", DATABASE_URL)
if not DATABASE_URL:
    raise ValueError("SQLALCHEMY_DATABASE_URL não está definida no ambiente.")

engine = create_engine(DATABASE_URL, echo=False)

POSTGRES_MAX_INTEGER_VALUE = 2147483647

def create_db_and_tables():
    """Cria as tabelas na bd com base nos metadados do SQLModel."""
    SQLModel.metadata.create_all(engine)
    logger.info("Tabelas na bd criadas (ou já existentes).")

def get_engine():
    """Retorna a instância do engine da bd."""
    return engine

def get_session() -> Generator[Session, None, None]:
    """Dependency para fornecer uma sessão de banco de dados síncrona."""
    with Session(engine) as session:
        yield session

predefined_global_tag_names = [
    {"name_pt": "Estudo", "name_en": "Study", "color": "#4287f5"},
    {"name_pt": "Trabalho", "name_en": "Work", "color": "#f5a742"},
    {"name_pt": "Pessoal", "name_en": "Personal", "color": "#42f56f"},
    {"name_pt": "Lazer", "name_en": "Fun", "color": "#f542d4"},
]

def seed_global_tags(session: Session):
    """Seed das tags globais padrão."""
    logger.info("A semear tags globais...")

    for tag_data in predefined_global_tag_names:
        # Verifica se a tag já existe com o nome em pt
        existing_tag = session.exec(
            select(TagModel).where(TagModel.name_pt == tag_data["name_pt"])
        ).first()
        
        #Se não existir, cria uma nova com os dois nomes
        if not existing_tag:
            new_tag = TagModel(
                name_pt=tag_data["name_pt"],
                name_en=tag_data["name_en"],
                color=tag_data.get("color"),
            )
            session.add(new_tag)

    session.commit()
    
def seed_gamification_data(session: Session):
    """Seed dos Níveis e Troféus para o ACEdemic Challenge."""
    logger.info("A semear dados de gamificação para o ACEdemic Challenge...")

    initial_levels = [
        {"code": "level_0", "name": "Início", "rank": 0, "description": "Nível inicial para todos os novos aventureiros.", "badge_icon_url": "/assets/badges/levels/level_0.png", "promotion_criteria_json": None},
        {"code": "level_1", "name": "Iniciado", "rank": 1, "description": "Complete os desafios iniciais para dominar a autoeficácia.", "badge_icon_url": "/assets/badges/levels/level_1.png", "promotion_criteria_json": None},
        {"code": "level_2", "name": "Intermédio", "rank": 2, "description": "Aprofunde a sua determinação e torne-se um pioneiro.", "badge_icon_url": "/assets/badges/levels/level_2.png", "promotion_criteria_json": None},
        {"code": "level_3", "name": "Avançado", "rank": 3, "description": "Construa hábitos sólidos para se tornar um campeão.", "badge_icon_url": "/assets/badges/levels/level_3.png", "promotion_criteria_json": None},
    ]

    level_codes_to_ids = {}
    for level_data in initial_levels:
        existing_level = session.exec(select(League).where(League.code == level_data["code"])).first()
        if not existing_level:
            new_level = League(**level_data)
            session.add(new_level)
            session.flush()
            level_codes_to_ids[new_level.code] = new_level.id
        else:
            level_codes_to_ids[existing_level.code] = existing_level.id
    session.commit()

    initial_badges_data = [
        # Início
        {"code": "ac_novato", "title": "Novato", "description": "Após finalizar a autenticação na app.", "level_code": "level_0", "criteria_json": {"type": "login_streak", "value": 1}},
        # Nível 1
        {"code": "ac_caloiro_autoeficacia", "title": "Caloiro da Autoeficácia", "description": "Após completar o primeiro desafio.", "level_code": "level_1", "criteria_json": {"type": "challenges_in_level", "value": 1}},
        {"code": "ac_prodigio_autoeficacia", "title": "Prodígio da Autoeficácia", "description": "Após completar os três primeiros desafios.", "level_code": "level_1", "criteria_json": {"type": "challenges_in_level", "value": 3}},
        {"code": "ac_mestre_disciplina", "title": "Mestre da Disciplina", "description": "Se cumprir 1 semana de desafios na totalidade (7 desafios seguidos).", "level_code": "level_1", "criteria_json": {"type": "challenge_streak", "value": 7}},
        {"code": "ac_campeao_consistencia", "title": "Campeão da Consistência", "description": "Se cumprir 2 semanas de desafios na totalidade (14 desafios seguidos).", "level_code": "level_1", "criteria_json": {"type": "challenge_streak", "value": 14}},
        {"code": "ac_iniciante_determinado", "title": "Iniciante Determinado", "description": "Após finalizar o Nível 1 (21 desafios).", "level_code": "level_1", "criteria_json": {"type": "challenges_in_level", "value": 21}},
        # Nível 2
        {"code": "ac_pioneiro_determinacao", "title": "Pioneiro da Determinação", "description": "Após completar o primeiro desafio do Nível 2.", "level_code": "level_2", "criteria_json": {"type": "challenges_in_level", "value": 1}},
        {"code": "ac_desbravador_autoeficacia", "title": "Desbravador da Autoeficácia", "description": "Após completar três desafios do Nível 2.", "level_code": "level_2", "criteria_json": {"type": "challenges_in_level", "value": 3}},
        {"code": "ac_mestre_desafio", "title": "Mestre do Desafio", "description": "Se cumprir 1 semana de desafios no Nível 2", "level_code": "level_2", "criteria_json": {"type": "challenge_streak", "value": 7}},
        {"code": "ac_guerreiro_resiliente", "title": "Guerreiro Resiliente", "description": "Se cumprir 2 semanas de desafios no Nível 2", "level_code": "level_2", "criteria_json": {"type": "challenge_streak", "value": 14}},
        {"code": "ac_cavaleiro_persistencia", "title": "Cavaleiro da Persistência", "description": "Após finalizar o Nível 2 (21 desafios).", "level_code": "level_2", "criteria_json": {"type": "challenges_in_level", "value": 21}},
        # Nível 3
        {"code": "ac_construtor_habitos", "title": "Construtor de Hábitos", "description": "Se cumprir 1 semana de desafios no Nível 3", "level_code": "level_3", "criteria_json": {"type": "challenge_streak", "value": 7}},
        {"code": "ac_campeao_autoeficacia", "title": "Campeão da Autoeficácia", "description": "Após finalizar o Nível 3 (21 desafios)", "level_code": "level_3", "criteria_json": {"type": "challenges_in_level", "value": 21}},
    ]


    for i, badge_data in enumerate(initial_badges_data):
        badge_code = badge_data["code"]
        level_code = badge_data.pop("level_code")
        level_id = level_codes_to_ids.get(level_code)
        existing_badge = session.exec(select(Badge).where(Badge.code == badge_code)).first()

        badge_fields = {
            "title": badge_data["title"],
            "description": badge_data["description"],
            "icon_url": f"/assets/badges/{badge_code}.png",
            "app_scope": "academic_challenge",
            "is_active": True,
            "criteria_json": badge_data["criteria_json"],
            "league_id": level_id,
            "display_order": i
        }
        if existing_badge:
            for key, value in badge_fields.items():
                setattr(existing_badge, key, value)
            session.add(existing_badge)
        else:
            new_badge = Badge(code=badge_code, **badge_fields)
            session.add(new_badge)
    session.commit()
    logger.info("Seeding de dados de gamificação para o ACEdemic Challenge concluído.")


def seed_all_data():
    """Função principal para semear todos os dados."""
    session = None
    try:
        session = next(get_session())
        seed_global_tags(session)
        seed_gamification_data(session)
        session.commit()
    except Exception as e:
        logger.error(f"Erro ao inserir dados de seed: {e}", exc_info=True)
        if session: session.rollback()
        raise
    finally:
        if session: session.close()