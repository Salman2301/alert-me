FROM node:10.11.0-alpine

WORKDIR /usr/src/app

COPY . .

EXPOSE 5000

RUN npm install

CMD npm run dev