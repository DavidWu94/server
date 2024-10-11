FROM node:latest

WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
RUN apt update
RUN apt install sqlite3
COPY . .
EXPOSE 3000
CMD [ "node","main.js" ]