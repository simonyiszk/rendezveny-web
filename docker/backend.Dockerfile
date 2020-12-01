FROM node:12.13-alpine

WORKDIR /usr/src/app
COPY backend/package*.json ./
RUN npm install

COPY ./backend .
RUN npm run build

CMD ["sh", "-c", "npm run migrate:up && npm run seed:dev && npm run start:prod"]