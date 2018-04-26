FROM node:8.11

# yarn > npm
# RUN npm install --global yarn

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

WORKDIR /var/app

RUN mkdir -p /var/app
ADD package.json /var/app/package.json
RUN $HOME/.yarn/bin/yarn --production

COPY . /var/app

# FIXME TODO: fix eslint warnings

# RUN mkdir tmp && \
#  npm test && \
#  ./node_modules/.bin/eslint . && \
#  npm run build

RUN \
  sed -i -e 's/127\.0\.0\.1/steemkr_mysql/g' src/db/config/config.json

RUN mkdir tmp

ENV PORT 8080
ENV NODE_ENV $NODE_ENV
ENV STEEMKR_VERSION $STEEMKR_VERSION

EXPOSE 8080

RUN \
  $HOME/.yarn/bin/yarn build

CMD \
  cp -rf ./config/production-$STEEMKR_VERSION.json ./config/production.json && \
  $HOME/.yarn/bin/yarn run production

# uncomment the lines below to run it in development mode
# ENV NODE_ENV development
# CMD [ "yarn", "run", "start" ]
