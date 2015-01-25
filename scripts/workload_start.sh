#!/bin/bash

die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 2 ] || die "2 argument required (num write users, num read users), $# provided"

~/benchmark/ab/ab -v 0 -k -t 999 -n 9999999 -c $2 -r -p ./postdata.txt 127.0.0.1:6666/procedureRevenueSelect/ &
~/benchmark/ab/ab -v 0 -k -t 999 -n 9999999 -c $1 -r -p ./postdata.txt 127.0.0.1:6666/procedureRevenueInsert/ &