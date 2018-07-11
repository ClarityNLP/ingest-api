FROM node:7.10.0

ENV APP_HOME /app
RUN mkdir $APP_HOME
WORKDIR $APP_HOME

RUN npm install pm2 -g

# some bash niceties
ADD .docker/root/.bashrc /root/

COPY package.json $APP_HOME
RUN npm install

COPY . .

EXPOSE 1340
# CMD ["npm", "start"]
CMD ["pm2-dev", "process.json"]
