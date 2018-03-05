FROM node

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
COPY . /app

EXPOSE 9005

CMD node src/bbt.js
