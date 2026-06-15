import pandas as pd
import os
import ast

PASTA_BRUTOS = '../dados_brutos/'
PASTA_OUTPUT = '../outputs/'

caminho_mood = os.path.join(PASTA_BRUTOS, 'st_mood_log.csv')

if not os.path.exists(caminho_mood):
    print("❌ Ficheiro st_mood_log.csv não encontrado. Verifica a pasta dados_brutos.")
else:
    df_mood = pd.read_csv(caminho_mood)

    # Filtrar dias maus
    dias_maus = df_mood[df_mood['value'] <= 2].copy()
    lista_impactos = []

    for index, row in dias_maus.iterrows():
        impactos_str = str(row['impacts']) 
        if impactos_str and impactos_str != 'nan':
            try:
                impactos = ast.literal_eval(impactos_str)
                if isinstance(impactos, list):
                    lista_impactos.extend(impactos)
            except:
                lista_impactos.append(impactos_str.replace('[', '').replace(']', '').replace('"', '').replace("'", ""))

    # Limpar espaços e colocar tudo em letra minúscula (para juntar "Estudo" com "estudo")
    lista_impactos = [imp.strip().lower() for imp in lista_impactos if imp.strip()]

    # Gerar documento de texto
    caminho_output = os.path.join(PASTA_OUTPUT, 'wordcloud_impactos_negativos.txt')
    
    with open(caminho_output, 'w', encoding='utf-8') as f:
        f.write(" ".join(lista_impactos))

    print(f"✅ Word Cloud criado. Encontradas {len(lista_impactos)} palavras")