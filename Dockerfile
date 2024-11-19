FROM node:22.3-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3002

CMD ["npm", "run", "start:dev"]
