FROM node:11.7.0-alpine

ENV APP_HOME /app
ENV RESUMABLE_DIR /var/lib/ingest-files
RUN mkdir $APP_HOME
WORKDIR $APP_HOME

RUN npm install pm2 -g
RUN apk add --no-cache bash

# some bash niceties
ADD .docker/root/.bashrc /root/

COPY package.json $APP_HOME

RUN npm install

#create resumable folder and set permissions
RUN mkdir -p RESUMABLE_DIR
RUN chmod +w RESUMABLE_DIR

COPY . .

ENTRYPOINT ["pm2-dev"]
CMD ["process.json"]
