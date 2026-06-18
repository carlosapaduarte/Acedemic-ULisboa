import pandas as pd
import os

print("1. A iniciar o script unificado de cotação (GSE + SRLI)...")

# Caminhos
caminho_ficheiro = '../dados_brutos/pos_teste_limpo.csv'
caminho_output = '../outputs/pos_teste_cotado_final.csv'

if not os.path.exists(caminho_ficheiro):
    print(f"❌ ERRO: Ficheiro não encontrado em {caminho_ficheiro}")
    exit()

print("2. A ler o ficheiro CSV...")
df_pre = pd.read_csv(caminho_ficheiro)

# ==============================================================================
# RENOMEAR COLUNAS PELA NOVA POSIÇÃO
# ==============================================================================
print("3. A renomear as colunas de ambas as escalas automaticamente...")

novos_nomes = {}
# A primeira coluna (índice 0) é o email
novos_nomes[df_pre.columns[0]] = 'email'

# AGORA AS PRIMEIRAS 10 SÃO DA GSE (índices de 1 a 10)
for i in range(1, 11):
    novos_nomes[df_pre.columns[i]] = f'GSE_{i}'

# AS SEGUINTES 36 SÃO DA SRLI (índices de 11 a 46)
for i in range(1, 37):
    # O índice 10 + i significa que começa na coluna 11, 12... até 46
    novos_nomes[df_pre.columns[10 + i]] = f'SRLI_{i}'

df_pre = df_pre.rename(columns=novos_nomes)

# ==============================================================================
# GARANTIR NÚMEROS
# ==============================================================================
print("4. A garantir que todas as 46 respostas são números matemáticos...")

todas_as_perguntas = [f'GSE_{i}' for i in range(1, 11)] + [f'SRLI_{i}' for i in range(1, 37)]

for coluna in todas_as_perguntas:
    df_pre[coluna] = pd.to_numeric(df_pre[coluna], errors='coerce')

# ==============================================================================
# CÁLCULOS: GSE (Autoeficácia)
# ==============================================================================
print("5. A processar a escala GSE (Autoeficácia)...")
colunas_gse = [f'GSE_{i}' for i in range(1, 11)]

df_pre['GSE_Total'] = df_pre[colunas_gse].sum(axis=1)
df_pre['GSE_Media'] = df_pre[colunas_gse].mean(axis=1)

# ==============================================================================
# CÁLCULOS: SRLI (Aprendizagem Autorregulada)
# ==============================================================================
print("6. A processar a escala SRLI...")
# Inverter o Item 15
df_pre['SRLI_15'] = 8 - df_pre['SRLI_15']

# Listas de subescalas
itens_sub1 = [f'SRLI_{i}' for i in [1, 2, 5, 6, 11, 12, 15, 16, 18, 19, 21, 22, 25, 26, 31, 32]]
itens_sub2 = [f'SRLI_{i}' for i in [3, 4, 7, 8, 13, 14, 20, 23, 24, 27, 28, 33, 34, 35, 36]]
itens_sub3 = [f'SRLI_{i}' for i in [9, 10, 17, 29, 30]]

# Calcular pontuações
df_pre['SRLI_Sub1_Antecipacao'] = df_pre[itens_sub1].sum(axis=1)
df_pre['SRLI_Sub2_Execucao']    = df_pre[itens_sub2].sum(axis=1)
df_pre['SRLI_Sub3_Autojulgamento'] = df_pre[itens_sub3].sum(axis=1)
df_pre['SRLI_Total'] = df_pre['SRLI_Sub1_Antecipacao'] + df_pre['SRLI_Sub2_Execucao'] + df_pre['SRLI_Sub3_Autojulgamento']

# ==============================================================================
# PREPARAR E EXPORTAR O FICHEIRO FINAL
# ==============================================================================
print("7. A exportar o dataset consolidado...")

# Selecionamos apenas o email e os resultados finais das DUAS escalas
colunas_finais = [
    'email', 
    'GSE_Total', 'GSE_Media',
    'SRLI_Sub1_Antecipacao', 'SRLI_Sub2_Execucao', 'SRLI_Sub3_Autojulgamento', 'SRLI_Total'
]

df_final = df_pre[colunas_finais]

# Removemos linhas onde o email está vazio
df_final = df_final.dropna(subset=['email'])

os.makedirs('../outputs/', exist_ok=True)
df_final.to_csv(caminho_output, index=False)

print(f"\n🚀 SUCESSO ABSOLUTO! Cotação de {len(df_final)} alunos terminada.")
print(f"Ficheiro guardado em: {caminho_output}")