FROM node:14.15.0

WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node","main.js" ]