FROM node:26

WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src
COPY public ./public

RUN npx sass public/assets/css/main.scss public/assets/css/main.css

CMD ["npm", "start"]