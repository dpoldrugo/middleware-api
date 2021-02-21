#!/usr/bin/env bash
while :
do
        #url='http://localhost:4000/api/status'
        url="https://middleware-api.potres2020.repl.co/api/status"
        printf "####################################################################\n"
        printf "Status check: $url\n";
        echo -n `date -Iseconds`
        printf " "
        curl -s -i $url | egrep 'X-Origin|OK'
        printf "\n"
        printf "Press [CTRL+C] to stop..\n"
        sleep $1
done
