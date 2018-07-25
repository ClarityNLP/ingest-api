FROM node:7.10.0

ENV APP_HOME /app
ENV RESUMABLE_DIR /var/lib/ingest-files
RUN mkdir $APP_HOME
WORKDIR $APP_HOME

RUN npm install pm2 -g

# some bash niceties
ADD .docker/root/.bashrc /root/

COPY package.json $APP_HOME

RUN npm install

#create resumable folder and set permissions
RUN mkdir -p RESUMABLE_DIR
RUN chmod +w RESUMABLE_DIR

COPY . .

EXPOSE 1340
# CMD ["npm", "start"]
CMD ["pm2-dev", "process.json"]
