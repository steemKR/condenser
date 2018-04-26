#!/bin/sh

EXIST_BLUE=$(docker-compose -f docker-compose.mysql.yml -f docker-compose.blue.yml ps | grep server | grep Up)

if [ -z "$EXIST_BLUE" ]; then
    docker-compose -f docker-compose.mysql.yml -f docker-compose.blue.yml pull
    docker-compose -f docker-compose.mysql.yml -f docker-compose.blue.yml up -d --build

    sleep 10

    docker-compose  -f docker-compose.mysql.yml -f docker-compose.green.yml stop server_green
else
    docker-compose -f docker-compose.mysql.yml -f docker-compose.green.yml pull
    docker-compose -f docker-compose.mysql.yml -f docker-compose.green.yml up -d --build

    sleep 10

    docker-compose  -f docker-compose.mysql.yml -f docker-compose.blue.yml stop server_blue
fi

