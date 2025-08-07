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
    """
    Dependency para fornecer uma sessão de banco de dados síncrona.
    Usada com `FastAPI.Depends`.
    """
    with Session(engine) as session:
        yield session

predefined_global_tag_names = ["fun", "work", "personal", "study"]

def seed_global_tags(session: Session):
    """Seed das tags globais padrão."""
    logger.info("A semear tags globais...")
    for tag_name in predefined_global_tag_names:
        existing_tag = session.exec(
            select(TagModel).where(TagModel.name == tag_name)
        ).first()
        if not existing_tag:
            new_tag = TagModel(name=tag_name)
            session.add(new_tag)
            logger.info(f"-> Adicionada Tag: '{tag_name}'")
    session.commit()


def seed_gamification_data(session: Session):
    """Seed de Badges e Leagues."""
    logger.info("A semear dados de gamificação (Badges e Leagues)...")

    initial_leagues = [
        #TODO trocar as do challenge pelas do st - corrigir badges
        {"code": "liga_bronze", "name": "Liga Bronze", "rank": 1, "description": "A liga inicial para novos utilizadores, focada em introdução às funcionalidades.", "badge_icon_url": "/icons/leagues/liga_bronze.png", "promotion_criteria_json": None},
        {"code": "liga_prata", "name": "Liga Prata", "rank": 2, "description": "Para aqueles que demonstraram um bom uso das ferramentas da app.", "badge_icon_url": "/icons/leagues/liga_prata.png", "promotion_criteria_json": {"type": "required_badges", "badges": ["ritmo_em_construcao", "planeador_frequente", "mestre_do_pomodoro", "maos_na_massa", "conselheiro_do_forum", "mestre_do_bloco", "malabarista"], "min_count": 5}},
        {"code": "liga_ouro", "name": "Liga Ouro", "rank": 3, "description": "Para os utilizadores mais dedicados e organizados, mestres na gestão académica.", "badge_icon_url": "/icons/leagues/liga_ouro.png", "promotion_criteria_json": {"type": "required_badges", "badges": ["forca_do_habito", "super_utilizador", "mestre_da_organizacao", "executor_de_elite", "colaborador_de_ouro", "mentor", "campeao_da_consistencia"], "min_count": 5}},
        {"code": "novato", "name": "Liga Novato", "rank": 4, "description": "A liga inicial para novos utilizadores.", "badge_icon_url": "/icons/leagues/novato.png", "promotion_criteria_json": None},
        {"code": "caloiro_autoeficacia", "name": "Liga Caloiro da Autoeficácia", "rank": 5, "description": "Para aqueles que completaram os primeiros desafios.", "badge_icon_url": "/icons/leagues/caloiro_autoeficacia.png", "promotion_criteria_json": {"type": "required_badges", "badges": ["primeiro_passo", "primeira_marcacao", "primeiro_foco"], "min_count": 3}},
        {"code": "explorador_desafios", "name": "Liga Explorador de Desafios", "rank": 6, "description": "Para os que se aventuram em mais desafios.", "badge_icon_url": "/icons/leagues/explorador_desafios.png", "promotion_criteria_json": {"type": "badge_completion_percentage", "target_league_code": "caloiro_autoeficacia", "percentage": 0.75}},
        {"code": "mestre_autoeficacia", "name": "Liga Mestre da Autoeficácia", "rank": 7, "description": "Os verdadeiros mestres em concluir desafios.", "badge_icon_url": "/icons/leagues/mestre_autoeficacia.png", "promotion_criteria_json": {"type": "required_badges", "badges": ["forca_do_habito", "mestre_da_organizacao", "mestre_do_pomodoro", "executor_de_elite", "mestre_do_bloco", "colaborador_de_ouro"], "min_count": 5}},
        {"code": "lenda_universitaria", "name": "Liga Lenda Universitária", "rank": 8, "description": "O topo da autoeficácia e realização académica.", "badge_icon_url": "/icons/leagues/lenda_universitaria.png", "promotion_criteria_json": {"type": "badge_completion_percentage", "target_league_code": "explorador_desafios", "percentage": 0.9}},
    ]
    
    #guardar os IDs das ligas após as inserir
    league_codes_to_ids = {}

    for league_data in initial_leagues:
        existing_league = session.exec(
            select(League).where(League.code == league_data["code"])
        ).first()
        if not existing_league:
            new_league = League(**league_data)
            session.add(new_league)
            session.flush()
            league_codes_to_ids[new_league.code] = new_league.id
            logger.info(f"    Adicionada Liga: '{league_data['code']}' (ID: {new_league.id})")
        else:
            league_codes_to_ids[existing_league.code] = existing_league.id
            logger.info(f"    Liga existente: '{existing_league.code}' (ID: {existing_league.id})")
    
    session.commit()

    # --- Definir e associar as Medalhas ---
    # Mapeamento de código da medalha -> código da liga
    badge_to_league_map = {
        # Bronze
        "primeiro_passo": "liga_bronze",
        "primeira_marcacao": "liga_bronze",
        "primeiro_foco": "liga_bronze",
        "primeiro_sprint": "liga_bronze",
        "escrita_em_curso": "liga_bronze",
        "curioso_oficial": "liga_bronze",
        "contributo_inicial": "liga_bronze",
        "ritmo_em_construcao": "liga_bronze", 

        # Prata
        "planeador_frequente": "liga_prata",
        "mestre_do_pomodoro": "liga_prata",
        "maos_na_massa": "liga_prata",
        "conselheiro_do_forum": "liga_prata",
        "mestre_do_bloco": "liga_prata",
        "malabarista": "liga_prata",
        "forca_do_habito": "liga_prata",

        # Ouro
        "super_utilizador": "liga_ouro",
        "mestre_da_organizacao": "liga_ouro",
        "executor_de_elite": "liga_ouro",
        "colaborador_de_ouro": "liga_ouro",
        "mentor": "liga_ouro",
        "campeao_da_consistencia": "liga_ouro",
    }
    
    initial_badges_data = [
        {"code": "primeiro_passo", "title": "Primeiro Passo", "description": "Primeiro login na aplicação.", "icon_url": "/assets/badges/primeiro_passo.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "login_streak", "value": 1}},
        {"code": "ritmo_em_construcao", "title": "Ritmo em Construção", "description": "5 dias de login consecutivos.", "icon_url": "/assets/badges/ritmo_em_construcao.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "login_streak", "value": 5}},
        {"code": "forca_do_habito", "title": "Força do Hábito", "description": "30 dias de login consecutivos.", "icon_url": "/assets/badges/forca_do_habito.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "login_streak", "value": 30}},
        {"code": "primeira_marcacao", "title": "Primeira Marcação", "description": "Adicionou o seu primeiro evento ao calendário.", "icon_url": "/assets/badges/primeira_marcacao.png", "app_scope": "study_tracker", "is_active": True, "criteria_json": {"type": "events_added", "value": 1}},
        {"code": "planeador_frequente", "title": "Planeador Frequente", "description": "Adicionou 10 eventos ao calendário.", "icon_url": "/assets/badges/planeador_frequente.png", "app_scope": "study_tracker", "is_active": True, "criteria_json": {"type": "events_added", "value": 10}},
        {"code": "mestre_da_organizacao", "title": "Mestre da Organização", "description": "Adicionou 50 eventos ao calendário.", "icon_url": "/assets/badges/mestre_da_organizacao.png", "app_scope": "study_tracker", "is_active": True, "criteria_json": {"type": "events_added", "value": 50}},
        {"code": "primeiro_foco", "title": "Primeiro Foco", "description": "Completou o seu primeiro ciclo Pomodoro.", "icon_url": "/assets/badges/primeiro_foco.png", "app_scope": "study_tracker", "is_active": True, "criteria_json": {"type": "pomodoro_cycles", "value": 1}},
        {"code": "mestre_do_pomodoro", "title": "Mestre do Pomodoro", "description": "Completou 25 ciclos Pomodoro.", "icon_url": "/assets/badges/mestre_do_pomodoro.png", "app_scope": "study_tracker", "is_active": True, "criteria_json": {"type": "pomodoro_cycles", "value": 25}},
        {"code": "primeiro_sprint", "title": "Primeiro Sprint", "description": "Concluiu a sua primeira tarefa.", "icon_url": "/assets/badges/primeiro_sprint.png", "app_scope": "study_tracker", "is_active": True, "criteria_json": {"type": "tasks_completed", "value": 1}},
        {"code": "maos_na_massa", "title": "Mãos na Massa", "description": "Concluiu 10 tarefas.", "icon_url": "/assets/badges/maos_na_massa.png", "app_scope": "study_tracker", "is_active": True, "criteria_json": {"type": "tasks_completed", "value": 10}},
        {"code": "executor_de_elite", "title": "Executor de Elite", "description": "Concluiu 50 tarefas.", "icon_url": "/assets/badges/executor_de_elite.png", "app_scope": "study_tracker", "is_active": True, "criteria_json": {"type": "tasks_completed", "value": 50}},
        {"code": "escrita_em_curso", "title": "Escrita em Curso", "description": "Adicionou a sua primeira entrada no Bloco de Notas.", "icon_url": "/assets/badges/escrita_em_curso.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "notepad_entries", "value": 1}},
        {"code": "mestre_do_bloco", "title": "Mestre do Bloco", "description": "Adicionou 20 entradas no Bloco de Notas.", "icon_url": "/assets/badges/mestre_do_bloco.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "notepad_entries", "value": 20}},
        {"code": "curioso_oficial", "title": "Curioso Oficial", "description": "Fez a sua primeira pergunta no Fórum.", "icon_url": "/assets/badges/curioso_oficial.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "forum_questions", "value": 1}},
        {"code": "contributo_inicial", "title": "Contributo Inicial", "description": "Deu a sua primeira resposta no Fórum.", "icon_url": "/assets/badges/contributo_inicial.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "forum_answers", "value": 1}},
        {"code": "conselheiro_do_forum", "title": "Conselheiro do Fórum", "description": "Fez 10 perguntas ou 10 respostas no Fórum.", "icon_url": "/assets/badges/conselheiro_do_forum.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "or", "criteria": [ {"type": "forum_questions", "value": 10}, {"type": "forum_answers", "value": 10} ]}},
        {"code": "colaborador_de_ouro", "title": "Colaborador de Ouro", "description": "Fez 50 perguntas ou 50 respostas no Fórum.", "icon_url": "/assets/badges/colaborador_de_ouro.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "or", "criteria": [ {"type": "forum_questions", "value": 50}, {"type": "forum_answers", "value": 50} ]}},
        {"code": "mentor", "title": "Mentor", "description": "Deu 100 respostas no Fórum.", "icon_url": "/assets/badges/mentor.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "forum_answers", "value": 100}},
        {"code": "malabarista", "title": "Malabarista", "description": "Usou 2 ferramentas diferentes em simultâneo.", "icon_url": "/assets/badges/malabarista.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "simultaneous_tool_uses", "value": 2}},
        {"code": "super_utilizador", "title": "Super Utilizador", "description": "Usou 3 ou mais ferramentas diferentes em simultâneo.", "icon_url": "/assets/badges/super_utilizador.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "simultaneous_tool_uses", "value": 3}},
        {"code": "campeao_da_consistencia", "title": "Campeão da Consistência", "description": "Fazer login na app durante 3 meses.", "icon_url": "/assets/badges/campeao_da_consistencia.png", "app_scope": "common", "is_active": True, "criteria_json": {"type": "login_streak", "value": 90}},
    ]

    logger.info("A semear e associar Medalhas às Ligas...")
    for badge_data in initial_badges_data:
        badge_code = badge_data["code"]
        league_code = badge_to_league_map.get(badge_code)
        
        league_id = None
        if league_code:
            league_id = league_codes_to_ids.get(league_code)
            if not league_id:
                logger.warning(f"  AVISO: ID da liga '{league_code}' não encontrado para a medalha '{badge_code}'.")
        else:
            logger.warning(f"  AVISO: Nenhuma liga mapeada para a medalha '{badge_code}'.")

        existing_badge = session.exec(
            select(Badge).where(Badge.code == badge_code)
        ).first()

        if existing_badge:
            # Se a medalha já existe, atualiza o league_id e outros campos se for necessário
            update_needed = False
            if existing_badge.league_id != league_id:
                existing_badge.league_id = league_id
                update_needed = True

            if update_needed:
                session.add(existing_badge)
                logger.info(f"    Atualizada Medalha '{badge_code}' (ID: {existing_badge.id}) com League ID: {league_id}.")
            else:
                logger.info(f"    Medalha '{badge_code}' já existe e está atualizada (League ID: {league_id}).")
        else:
            # Se a medalha não existe, crie-a com o league_id
            new_badge_data = {**badge_data, "league_id": league_id}
            new_badge = Badge(**new_badge_data)
            session.add(new_badge)
            logger.info(f"    Adicionada Nova Medalha '{badge_code}' com League ID: {league_id}.")

    session.commit()

    logger.info("Seeding de dados de gamificação concluído.")


def seed_all_data():
    """Função principal para semear todos os dados."""
    session = None
    try:
        session = next(get_session())
        seed_global_tags(session)
        seed_gamification_data(session)
        session.commit()
        logger.info("Dados de seed globais e de gamificação inseridos ou já existentes.")
    except Exception as e:
        logger.error(f"Erro ao inserir dados de seed: {e}", exc_info=False)
        if session:
            session.rollback()
        raise
    finally:
        if session:
            session.close()
    logger.info("Seeding de dados concluído.")