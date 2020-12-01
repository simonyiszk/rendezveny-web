FROM node:12.13-alpine As development

WORKDIR /usr/src/app
COPY frontend/package*.json ./
RUN npm install

ARG GATSBY_SERVER_API_URL=http://localhost:3000/api/v1
ENV GATSBY_SERVER_API_URL=${GATSBY_SERVER_API_URL}

COPY ./frontend .
RUN npm run build

FROM node:12.13-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY frontend/package*.json ./
RUN npm install --only=production

COPY ./frontend .
COPY --from=development /usr/src/app/public ./public

CMD ["sh", "-c", "npm run serve"]