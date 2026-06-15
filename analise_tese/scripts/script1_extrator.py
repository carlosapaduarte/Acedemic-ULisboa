import pandas as pd
import os

# ==============================================================================
# 1. CONFIGURAÇÕES INICIAIS
# ==============================================================================
DATA_CORTE = pd.to_datetime('2026-06-05 23:59:59') 

PASTA_BRUTOS = '../dados_brutos/'
PASTA_OUTPUT = '../outputs/'

OBJETIVOS_DICT = {
    0: "Nenhum / Ignorado",
    1: "Melhorar as minhas notas/classificações",
    2: "Acompanhar o meu progresso",
    3: "Preparar-me para exames específicos",
    4: "Personalizar o meu plano de estudo",
    5: "Cumprir prazos e entregas",
    6: "Gerir os estudos com as outras áreas da minha vida"
}

TAGS_PREDEFINIDAS = ["Estudo", "Aula", "Autocuidado", "Lazer", "Projeto", "Study", "Class", "Self-care", "Leisure"]

def ler_csv(nome_ficheiro):
    caminho = os.path.join(PASTA_BRUTOS, nome_ficheiro)
    if os.path.exists(caminho):
        return pd.read_csv(caminho)
    print(f"⚠️ Aviso: {nome_ficheiro} não encontrado.")
    return pd.DataFrame()

# ==============================================================================
# 2. CARREGAR OS DADOS
# ==============================================================================
print("A carregar bases de dados...")

caminho_alunos = os.path.join(PASTA_BRUTOS, 'grupos_alunos.csv')
if not os.path.exists(caminho_alunos):
    print("❌ Ficheiro 'grupos_alunos.csv' não encontrado!")
    exit()

df_alunos = pd.read_csv(caminho_alunos, header=None, names=['grupo', 'email'])

df_user = ler_csv('user.csv')
df_access_log = ler_csv('access_log.csv')
df_st_task = ler_csv('st_task.csv')
df_st_event = ler_csv('st_event.csv')
df_st_task_tag = ler_csv('st_task_tag.csv') 
df_week_study = ler_csv('week_study_time.csv')
df_mood = ler_csv('st_mood_log.csv')
df_goals = ler_csv('st_app_use_model.csv')
df_metrics = ler_csv('user_metrics.csv')
df_badges = ler_csv('user_badges.csv')
df_leagues = ler_csv('user_leagues.csv')

# ==============================================================================
# 3. FILTROS E PREPARAÇÃO GERAL
# ==============================================================================
if not df_user.empty:
    df_user = df_user.rename(columns={'id': 'user_id', 'institutional_email': 'email'})

def filtrar_por_data(df, coluna_data):
    if not df.empty and coluna_data in df.columns:
        df[coluna_data] = pd.to_datetime(df[coluna_data], errors='coerce')
        return df[df[coluna_data] <= DATA_CORTE]
    return df

df_access_log = filtrar_por_data(df_access_log, 'timestamp')
df_st_event = filtrar_por_data(df_st_event, 'start_date')
df_mood = filtrar_por_data(df_mood, 'date')
df_badges = filtrar_por_data(df_badges, 'awarded_at')

# Nota Importante: NÃO filtramos globalmente a tabela df_st_task!
# Se filtrássemos, apagávamos as tarefas que os alunos criaram mas nunca concluíram.
# O filtro do DATA_CORTE para as tarefas é feito lá em baixo, apenas nas "concluídas".

# ==============================================================================
# 4. CALCULAR E EXTRAIR
# ==============================================================================
print("A processar métricas de cada aluno...")
resultados = []

for index, row in df_alunos.iterrows():
    email_aluno = row['email']
    grupo_aluno = str(row['grupo']).strip()
    
    # 💡 Lógica de Bloqueio (0 vs NaN) consoante o grupo
    v_base = None if grupo_aluno.lower() == 'controlo' else 0
    v_tracker = 0 if grupo_aluno.lower() in ['tracker', 'ambas'] else None
    v_challenge = 0 if grupo_aluno.lower() in ['challenge', 'ambas'] else None

    aluno_stats = {
        'email': email_aluno, 'grupo': grupo_aluno,
        'primeiro_log': None, 'ultimo_log': None, 'dias_ativos': v_base,
        'tracker_actions': v_tracker, 'tracker_views': v_tracker, 'tracker_intents': v_tracker,
        'challenge_actions': v_challenge, 'challenge_views': v_challenge, 'challenge_intents': v_challenge,
        'pomodoros_iniciados': v_tracker, 'desafios_21_dias_iniciados': v_challenge,
        'tarefas_criadas': v_tracker, 'tarefas_concluidas': v_tracker, 'tarefas_no_prazo': v_tracker,
        'soma_planned_minutes': v_tracker, 'soma_tracked_minutes': v_tracker,
        'tarefas_normais': v_tracker, 'tarefas_mae_totais': v_tracker, 'tarefas_subtarefas': v_tracker,
        'eventos_totais': v_tracker, 'espacos_de_trabalho': v_tracker,
        'soma_minutos_estudo': v_tracker, 'soma_sessoes_estudo': v_tracker,
        'moda_mood': None, 'objetivo_inicial': None,
        'tags_predefinidas_usadas': v_tracker, 'tags_customizadas_criadas': v_tracker,
        'login_streak_maximo': v_challenge, 'desafios_diarios_concluidos': v_challenge,
        'primeira_liga': None, 'ultima_liga': None,
        'total_medalhas': v_challenge, 
        'ganhou_medalha_21_dias': False if v_challenge == 0 else None, 
        'datas_medalhas_raw': None
    }

    uids_do_aluno = []
    if not df_user.empty:
        uids_do_aluno = df_user[df_user['email'] == email_aluno]['user_id'].tolist()

    if not uids_do_aluno or grupo_aluno.lower() == 'controlo':
        resultados.append(aluno_stats)
        continue

    # --- MÉTRICAS COMUNS (ACCESS LOG) ---
    logs_user = df_access_log[df_access_log['user_id'].isin(uids_do_aluno)]
    if not logs_user.empty:
        aluno_stats['primeiro_log'] = logs_user['timestamp'].min()
        aluno_stats['ultimo_log'] = logs_user['timestamp'].max()
        aluno_stats['dias_ativos'] = logs_user['timestamp'].dt.date.nunique()
        
        if v_tracker == 0:
            tracker_logs = logs_user[logs_user['app_targeted'] == 'tracker']
            aluno_stats['tracker_actions'] = len(tracker_logs[tracker_logs['action_type'] == 'action'])
            aluno_stats['tracker_views'] = len(tracker_logs[tracker_logs['action_type'] == 'page_view'])
            aluno_stats['tracker_intents'] = len(tracker_logs[tracker_logs['action_type'] == 'intent'])
            aluno_stats['pomodoros_iniciados'] = len(logs_user[logs_user['action_detail'] == 'start_pomodoro'])

        if v_challenge == 0:
            challenge_logs = logs_user[logs_user['app_targeted'] == 'challenge']
            aluno_stats['challenge_actions'] = len(challenge_logs[challenge_logs['action_type'] == 'action'])
            aluno_stats['challenge_views'] = len(challenge_logs[challenge_logs['action_type'] == 'page_view'])
            aluno_stats['challenge_intents'] = len(challenge_logs[challenge_logs['action_type'] == 'intent'])
            aluno_stats['desafios_21_dias_iniciados'] = len(logs_user[logs_user['action_detail'] == 'start_challenge'])

    # --- TRACKER ---
    if v_tracker == 0:
        tasks_user = df_st_task[df_st_task['user_id'].isin(uids_do_aluno)]
        if not tasks_user.empty:
            aluno_stats['tarefas_criadas'] = len(tasks_user)
            
            # Conta como concluídas Apenas se acabaram antes do DIA_CORTE
            tarefas_concluidas = tasks_user[
                (tasks_user['status'] == 'completed') & 
                (pd.to_datetime(tasks_user['completed_at'], errors='coerce') <= DATA_CORTE)
            ]
            aluno_stats['tarefas_concluidas'] = len(tarefas_concluidas)
            
            if 'completed_at' in tasks_user.columns and 'deadline' in tasks_user.columns:
                no_prazo = tarefas_concluidas[
                    pd.to_datetime(tarefas_concluidas['completed_at']) <= pd.to_datetime(tarefas_concluidas['deadline'])
                ]
                aluno_stats['tarefas_no_prazo'] = len(no_prazo)
            
            aluno_stats['soma_planned_minutes'] = tasks_user['planned_minutes'].sum()
            aluno_stats['soma_tracked_minutes'] = tasks_user['tracked_minutes'].sum()

            # Lógica corrigida das Tarefas Mães, Filhas e Normais
            if 'id' in tasks_user.columns and 'parent_task_id' in tasks_user.columns:
                # 1. Subtarefas (Têm o parent_task_id preenchido)
                aluno_stats['tarefas_subtarefas'] = len(tasks_user[tasks_user['parent_task_id'].notna()])
                
                # 2. Tarefas Mãe (O seu ID aparece no parent_task_id de outras tarefas)
                ids_pais_existentes = tasks_user['parent_task_id'].dropna().unique()
                aluno_stats['tarefas_mae_totais'] = len(tasks_user[tasks_user['id'].isin(ids_pais_existentes)])
                
                # 3. Tarefas Normais (Total - Mães - Subtarefas)
                aluno_stats['tarefas_normais'] = (
                    aluno_stats['tarefas_criadas'] - 
                    aluno_stats['tarefas_mae_totais'] - 
                    aluno_stats['tarefas_subtarefas']
                )

        events_user = df_st_event[df_st_event['user_id'].isin(uids_do_aluno)]
        if not events_user.empty:
            aluno_stats['eventos_totais'] = len(events_user)
            aluno_stats['espacos_de_trabalho'] = len(events_user[events_user['task_id'].notna()])

        week_user = df_week_study[df_week_study['user_id'].isin(uids_do_aluno)]
        if not week_user.empty:
            aluno_stats['soma_minutos_estudo'] = week_user['total'].sum()
            aluno_stats['soma_sessoes_estudo'] = week_user['n_of_sessions'].sum()

        mood_user = df_mood[df_mood['user_id'].isin(uids_do_aluno)]
        if not mood_user.empty:
            moda_mood = mood_user['value'].mode()
            aluno_stats['moda_mood'] = moda_mood[0] if not moda_mood.empty else None

        tags_user = df_st_task_tag[df_st_task_tag['user_id'].isin(uids_do_aluno)]
        if not tags_user.empty and 'tag_name' in tags_user.columns: 
            predefinidas = tags_user[tags_user['tag_name'].isin(TAGS_PREDEFINIDAS)]
            customizadas = tags_user[~tags_user['tag_name'].isin(TAGS_PREDEFINIDAS)]
            aluno_stats['tags_predefinidas_usadas'] = len(predefinidas)
            aluno_stats['tags_customizadas_criadas'] = len(customizadas)

        goals_user = df_goals[df_goals['user_id'].isin(uids_do_aluno)]
        if not goals_user.empty:
            goal_id = goals_user.iloc[0]['goal_id']
            aluno_stats['objetivo_inicial'] = OBJETIVOS_DICT.get(goal_id, f"ID_{goal_id}")

    # --- CHALLENGE ---
    if v_challenge == 0:
        metrics_user = df_metrics[df_metrics['user_id'].isin(uids_do_aluno)]
        if not metrics_user.empty:
            aluno_stats['login_streak_maximo'] = metrics_user['login_streak'].max()
            aluno_stats['desafios_diarios_concluidos'] = metrics_user['completed_challenges_count'].max()

        leagues_user = df_leagues[df_leagues['user_id'].isin(uids_do_aluno)]
        if not leagues_user.empty and 'date' in leagues_user.columns:
            leagues_user = leagues_user.sort_values(by='date')
            aluno_stats['primeira_liga'] = leagues_user.iloc[0]['league_id']
            aluno_stats['ultima_liga'] = leagues_user.iloc[-1]['league_id']

        badges_user = df_badges[df_badges['user_id'].isin(uids_do_aluno)]
        if not badges_user.empty:
            aluno_stats['total_medalhas'] = len(badges_user)
            
            # 🚨 🚨 🚨 TODO: MUDAR OS IDS DAS MEDALHAS AQUI 🚨 🚨 🚨
            # Substituir os números 997, 998, 999 pelos IDs exatos das 3 medalhas dos 21 dias
            medalhas_conclusao = [997, 998, 999] 
            aluno_stats['ganhou_medalha_21_dias'] = badges_user['badge_id'].isin(medalhas_conclusao).any()
            # 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨
            
            todas_as_medalhas_datas = badges_user[['badge_id', 'awarded_at']].to_dict('records')
            aluno_stats['datas_medalhas_raw'] = str(todas_as_medalhas_datas)

    resultados.append(aluno_stats)

# ==============================================================================
# 5. GERAR FICHEIRO FINAL
# ==============================================================================
if not os.path.exists(PASTA_OUTPUT):
    os.makedirs(PASTA_OUTPUT)

df_final = pd.DataFrame(resultados)
caminho_output = os.path.join(PASTA_OUTPUT, 'raw_metrics_extraidas.csv')
df_final.to_csv(caminho_output, index=False)
print(f"🚀 Sucesso! Analisados {len(df_final)} alunos. Ficheiro guardado em: {caminho_output}")