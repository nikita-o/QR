FROM satantime/puppeteer-node:latest

WORKDIR /puppeteer

COPY . .

RUN npm i

RUN npm run build

CMD ["npm", "run", "start"]
