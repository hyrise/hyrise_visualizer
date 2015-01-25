#!/bin/bash

#../ab/ab -G ab_reads.log -l 6 -v 1 -k -t 180 -n 9999999 -c 50 -r -m revenue_reads_8M.txt 192.168.30.112:6666/jsonQuery
~/benchmark/ab/ab -v 0 -k -t 180 -n 9999999 -c $1 -r -p ~/hyrise_visualizer/scripts/postdata.txt 127.0.0.1:6666/procedureRevenueSelect/ &