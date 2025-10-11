FROM node:24-slim 

WORKDIR /plantlog_app 

COPY package*.json ./ 

RUN npm install --production 

COPY . . 

RUN mkdir -p /plantlog_app/data 

EXPOSE 3000

CMD ["node", "app.js"]