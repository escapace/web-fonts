FROM node:17-alpine

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache \
  libxslt-dev libxml2-dev py3-brotli \
  zopfli gcc libc-dev python3-dev python3 shadow sudo \
  && ln -sf python3 /usr/bin/python \
  && python3 -m ensurepip \
  && pip3 install --no-cache --upgrade pip setuptools
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt && rm -f requirements.txt \
  && mkdir -p /web-fonts/src/utilities /web-fonts/lib/cli

ENV UID=1000
ENV GID=1000
ENV UMASK=0022

COPY lib/cli/cli.cjs /web-fonts/lib/cli
COPY lib/cli/cli.cjs.map /web-fonts/lib/cli
COPY src/utilities/font-loader.ts /web-fonts/src/utilities
COPY src/utilities/font-strip.py /web-fonts/src/utilities
COPY package.json /web-fonts
COPY pnpm-lock.yaml /web-fonts
COPY scripts/docker-entrypoint.sh /usr/local/bin/

WORKDIR /web-fonts

RUN npm install -g pnpm \
  && find /web-fonts -type d -exec chmod 755 {} \+ \
  && find /web-fonts -type f -exec chmod 644 {} \+ \
  && pnpm install --ignore-scripts --shamefully-hoist --frozen-lockfile --prod \
  && deluser --remove-home node \
  && (delgroup node || true)

ENTRYPOINT ["docker-entrypoint.sh"]
CMD []
