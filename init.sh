#!/usr/bin/env bash

docker-compose run --rm origami npm install
#docker-compose run --rm origami bower install --allow-root
docker-compose run --rm origami npm install -g origami-build-tools@6.2.5
docker-compose run --rm origami /app/node_modules/.bin/obt install
