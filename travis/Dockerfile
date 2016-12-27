FROM node:4.2.2

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD ${PROJECT_DIR} /usr/src/app
RUN npm i npm@3 -g
RUN npm i grunt -g
RUN npm i mocha -g
RUN npm i
RUN grunt
RUN mocha ./test/mochajs/**/*.js
