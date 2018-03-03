#!/usr/bin/env bash

#./obt.sh build --js=./client/js/main.js --sass=./client/scss/main.scss --buildJs=./output/bundle.js --buildCss=./bundle.css --buildFolder=public
#./obt.sh build --js=./client/js/main.js --sass=./client/scss/main.scss --buildJs=./output/bundle.js --buildCss=./bundle.css --buildFolder=public
./obt.sh build --sass=/app/client/main.scss --buildCss=bundle.css --buildFolder=/app/public --js=/app/client/main.js --buildJs=bundle.js
