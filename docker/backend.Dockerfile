FROM node:12.13-alpine As development

WORKDIR /usr/src/app
COPY backend/package*.json ./
RUN npm install --only=development

COPY ./backend .
RUN npm run build

FROM node:12.13-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY backend/package*.json ./
RUN npm install --only=production
RUN npm install ts-node

COPY ./backend .
COPY --from=development /usr/src/app/dist ./dist

CMD ["sh", "-c", "npm run migrate:up && npm run start:prod"]