# Deploy

## Setup Files

See: [docker-compose.yml](docker-compose.yml).
See: [config.ts](src\frontend\study-tracker\app\service\config.ts) and set the `BASE_API_URL` to the URL of the
API.

## Deploy Application

```bash
$ bash src/deploy/fresh_install.sh
```

```bash
$ bash src/deploy/reset_and_deploy_docker.sh
```