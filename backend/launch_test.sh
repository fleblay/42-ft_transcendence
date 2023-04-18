#lunch postgres docker
#envoyer le .env.test dans le docker
docker run -d -p 5432:5432 --name postgresTest -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres -e POSTGRES_HOST=postgres postgres

npm run test:e2e
