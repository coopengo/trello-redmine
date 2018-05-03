from node:8-alpine

RUN mkdir trello
WORKDIR trello

COPY package.json .
RUN yarn install --production

COPY . .

ENTRYPOINT ["yarn", "start"]
