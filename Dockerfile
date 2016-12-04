FROM alpine

RUN apk add --no-cache nodejs

WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app

EXPOSE 1337

CMD node node_modules/sails/bin/sails.js lift
