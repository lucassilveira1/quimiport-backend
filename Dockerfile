FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --production

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/infra/migrations ./src/infra/migrations
COPY --from=build /usr/src/app/docs/openapi.yaml ./docs/openapi.yaml

EXPOSE 3000

# Aplica as migrations pendentes e só então sobe a API.
CMD ["sh", "-c", "node dist/infra/database/migrate.js && node dist/server.js"]
