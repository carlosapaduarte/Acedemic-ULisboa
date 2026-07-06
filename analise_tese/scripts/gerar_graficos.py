import os
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

PASTA_OUTPUT = '../outputs/'
PASTA_GRAFICOS = os.path.join(PASTA_OUTPUT, 'graficos')
os.makedirs(PASTA_GRAFICOS, exist_ok=True)

# 1. Carregar e cruzar dados
try:
    df_metrics = pd.read_csv(os.path.join(PASTA_OUTPUT, 'raw_metrics_extraidas.csv'))
    df_pre = pd.read_csv(os.path.join(PASTA_OUTPUT, 'pre_teste_cotado_final.csv'))
    df_total = pd.merge(df_metrics, df_pre, on='email', how='inner')
except Exception as e:
    print(f"Erro ao ler ficheiros: {e}. Garanta que correu os scripts anteriores.")
    exit()

# Estilo sóbrio e académico (estilo SPSS/Excel profissional)
sns.set_theme(style="whitegrid")
plt.rcParams.update({'font.size': 11})

# Gráfico 1: SRLI Total por Grupo (Barras)
plt.figure(figsize=(6, 4))
sns.barplot(data=df_total, x='grupo', y='SRLI_Total', palette='Blues_d', errorbar=None)
plt.title('Média de Autorregulação (SRLI) por Grupo')
plt.tight_layout()
plt.savefig(os.path.join(PASTA_GRAFICOS, '1_srli_grupo.png'), dpi=300)
plt.close()

# Gráfico 2: Tarefas no Prazo por Grupo (Boxplot)
if 'tarefas_no_prazo' in df_total.columns:
    plt.figure(figsize=(6, 4))
    sns.boxplot(data=df_total, x='grupo', y='tarefas_no_prazo', palette='Greens_d')
    plt.title('Distribuição de Tarefas no Prazo')
    plt.tight_layout()
    plt.savefig(os.path.join(PASTA_GRAFICOS, '2_tarefas_prazo.png'), dpi=300)
    plt.close()

# Gráfico 3: Correlação Autoeficácia vs Minutos de Estudo (Dispersão)
if 'GSE_Total' in df_total.columns and 'soma_minutos_estudo' in df_total.columns:
    plt.figure(figsize=(6, 4))
    sns.scatterplot(data=df_total, x='GSE_Total', y='soma_minutos_estudo', hue='grupo', s=100)
    plt.title('Autoeficácia vs. Minutos de Estudo')
    plt.tight_layout()
    plt.savefig(os.path.join(PASTA_GRAFICOS, '3_gse_vs_minutos.png'), dpi=300)
    plt.close()

print(f"✅ Gráficos gerados com sucesso na pasta: {PASTA_GRAFICOS}")