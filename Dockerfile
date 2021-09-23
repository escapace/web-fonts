FROM node:16-alpine

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache \
  libxslt-dev libxml2-dev py3-brotli \
  zopfli gcc libc-dev python3-dev python3 shadow sudo \
  && ln -sf python3 /usr/bin/python \
  && python3 -m ensurepip \
  && pip3 install --no-cache --upgrade pip setuptools
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt && rm -f requirements.txt

COPY lib/pack/escapace-web-fonts-0.0.0.tgz /tmp/escapace-web-fonts-0.0.0.tgz
RUN npm install -g /tmp/escapace-web-fonts-0.0.0.tgz \
    && rm -f /tmp/escapace-web-fonts-0.0.0.tgz \
    && deluser --remove-home node \
    && (delgroup node || true)

COPY scripts/docker-entrypoint.sh /usr/local/bin/

ENV UID=1000
ENV GID=1000
ENV UMASK=0022

ENTRYPOINT ["docker-entrypoint.sh"]
CMD []
