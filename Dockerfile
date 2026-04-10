FROM node:20 AS build
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY server ./server
COPY .env ./

RUN npm install -g serve concurrently
RUN npm install --save-dev tsx

EXPOSE 4173
EXPOSE 3001

CMD ["concurrently", "serve -s dist -l 4173", "npx tsx server/index.ts"]