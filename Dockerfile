FROM node:18.17.0-alpine3.17 AS develop

RUN \
  addgroup -S cybert && \
  adduser -S cybert -G cybert && \
  mkdir /cybert && \
  chown -R cybert:cybert /cybert
WORKDIR /cybert
USER cybert

COPY --chown=cybert:cybert package.json package-lock.json ./
RUN npm install
COPY --chown=cybert:cybert . .

CMD ["npm", "run", "start:watch"]

FROM develop as production

RUN \
  npm run lint && \
  npm run test && \
  npm run build

CMD ["npm", "run", "start"]
