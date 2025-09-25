FROM python:3.12

WORKDIR /code

COPY ./src/requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./alembic.ini /code/alembic.ini
COPY ./migrations /code/migrations

COPY ./src /code/app

CMD ["fastapi", "run", "app/main.py", "--port", "80"]