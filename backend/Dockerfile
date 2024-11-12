# Usar a imagem do Node.js baseada no Alpine
FROM node:18-alpine

WORKDIR /usr/src/app

ENV DB_TYPE=mysql \
    DB_HOST=database-azzo.cj46y6k2uqf8.sa-east-1.rds.amazonaws.com \
    DB_PORT=3306 \
    DB_USERNAME=user \
    DB_PASSWORD=senha123 \
    DB_NAME=bancoAzzo \
    DB_LOGGING=true \
    PORT=3000 \
    JWT_SECRET=Yyh6NmrK5q38gjMd6HB5XPXDY4 \
    JWT_EXPIRES_IN=5h

COPY package*.json ./

# Instalar as dependências
RUN npm install

COPY . .

# Expor a porta usada pelo NestJS
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "start:dev"]
