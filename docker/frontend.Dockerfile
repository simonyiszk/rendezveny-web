FROM node:12.13-alpine

WORKDIR /usr/src/app
COPY frontend/package*.json ./
RUN npm install

ARG GATSBY_SERVER_API_URL=http://localhost:3000/api/v1
ENV GATSBY_SERVER_API_URL=${GATSBY_SERVER_API_URL}

COPY ./frontend .
RUN npm run build

CMD ["sh", "-c", "npm run serve"]