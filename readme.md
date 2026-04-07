## Запуск проекта

### Базовый
```bash
docker-compose -f docker.compose.yaml up

### Первый запуск или после изменений в схеме БД:

```bash
docker-compose -f docker.compose.yaml up -d db
docker-compose -f docker.compose.yaml run --rm migrate npx prisma migrate deploy

docker-compose -f docker.compose.yaml --profile migration up -d migrate

docker-compose -f docker.compose.yaml up --build