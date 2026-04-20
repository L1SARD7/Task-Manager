FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --network-timeout 1000000

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]