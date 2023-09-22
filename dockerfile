FROM node:19.5-alpine
WORKDIR /classroom/assignment
COPY package.json .
RUN npm install
COPY . .
CMD node app.js
