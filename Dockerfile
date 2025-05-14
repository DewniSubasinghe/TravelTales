# official Node.js image as base
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /usr/src/app/db && chown -R node:node /usr/src/app/db

USER node

EXPOSE 5000

CMD [ "npm", "start" ]