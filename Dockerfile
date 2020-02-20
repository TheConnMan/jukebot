FROM alpine:3.8

RUN apk add --no-cache git npm

WORKDIR /usr/src/app

COPY package.json /usr/src/app

RUN npm install

COPY . /usr/src/app

EXPOSE 1337

CMD if [[ -z "${MYSQL_HOST}" ]]; then npm start; else npm run migrate && npm start; fi
