#!/bin/bash

# Define o username que queres apagar
USERNAME="fc58620"

echo "💣 A apagar tudo do utilizador $USERNAME..."

docker exec -i deploy-postgresdb-1 psql -U postgres -d postgres <<EOF
-- 1. QUEBRAR DEPENDÊNCIAS
UPDATE st_event SET task_id = NULL WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
UPDATE st_task SET parent_task_id = NULL WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');

-- 2. LIMPAR TRACKER
DELETE FROM st_event_tag WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM st_event WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM st_task WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');

-- 3. LIMPAR DADOS DIVERSOS DO TRACKER
DELETE FROM st_mood_log WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM daily_energy_status WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM st_app_use_model WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM st_schedule_block_not_available WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM st_week_day_planning WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM week_study_time WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM st_archive WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM st_grade WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM st_curricular_unit WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM user_tag_link WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM daily_tag WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');

-- 4. LIMPAR GAMIFICAÇÃO
DELETE FROM user_badges WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM user_leagues WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM user_metrics WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');

-- 5. LIMPAR CHALLENGE
DELETE FROM challenge WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM batch_day WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');
DELETE FROM batch WHERE user_id IN (SELECT id FROM "user" WHERE username = '$USERNAME');

-- 6. APAGAR O USER
DELETE FROM "user" WHERE username = '$USERNAME';
EOF

echo "✅ Utilizador $USERNAME apagado com sucesso!"