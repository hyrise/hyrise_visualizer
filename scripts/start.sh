#!/bin/bash


function checkprocess {
 if ps -p $1 > /dev/null
 then
  echo "$1 is running"
 else
  exit 1
 fi
}

rm ab_reads.log
rm ab_writes.log

cd ~/hyrise_nvm

BINARY=~/hyrise_nvm/build/hyrise-server_release
DISPATCHER=~/dispatcher/dispatcher
DISPATCHPORT=6666
SETUPQUERY=~/benchmark/visualizer2/insert_test.json
PERSISTENCYDIR=~/logs

#calculate CPU offsets
off1=$1
off2=$((off1 + $2))
off3=$((off2 + $3))

echo "Starting Hyrise cluster with 1 master and 3 replica..."
echo "Binary file is $BINARY"
pwd


#wait
echo "waiting for dispatcher port..."
n=1
while [ $n -gt 0 ] 
do
 n=$(netstat | grep $DISPATCHPORT | wc -l)
 echo $n
 sleep 1
done

# start master
echo "Starting master..."
($BINARY -p 5000 -n 0 --corecount $1 --coreoffset 0 --commitWindow 1 --persistencyDirectory $PERSISTENCYDIR > ~/logs/log1.txt) &
master_pid=$!
echo $master_pid > ~/masterid.txt
sleep 1
checkprocess $master_pid

# create table on master
echo "Executing $SETUPQUERY @ Master..."
curl -X POST --data-urlencode "query@$SETUPQUERY" http://localhost:5000/jsonQuery

sleep 1

# start replica 1-3
echo "Starting replica 1..."
($BINARY -p 5001 -n 1 --corecount $2 --coreoffset $off1 --commitWindow 1 --persistencyDirectory $PERSISTENCYDIR > ~/logs/log2.txt) &
r1_pid=$!
sleep 1

echo "Executing $SETUPQUERY @ R1..."
curl -X POST --data-urlencode "query@$SETUPQUERY" http://localhost:5001/jsonQuery

echo "Starting replica 2..."
($BINARY -p 5002 -n 2 --corecount $3 --coreoffset $off2 --commitWindow 1 --persistencyDirectory $PERSISTENCYDIR > ~/logs/log3.txt)&
r2_pid=$!
sleep 1

echo "Executing $SETUPQUERY @ R2..."
curl -X POST --data-urlencode "query@$SETUPQUERY" http://localhost:5002/jsonQuery

echo "Starting replica 3..."
($BINARY -p 5003 -n 3 --corecount $4 --coreoffset $off3 --commitWindow 1 --persistencyDirectory $PERSISTENCYDIR > ~/logs/log4.txt)&
r3_pid=$!
sleep 1

echo "Executing $SETUPQUERY @ R3..."
curl -X POST --data-urlencode "query@$SETUPQUERY" http://localhost:5003/jsonQuery


echo "starting dispatcher on port $DISPATCHPORT..."
(taskset -c 0,1 $DISPATCHER $DISPATCHPORT > ~/logs/log_disp.txt)&
d_pid=$!
sleep 1
checkprocess $d_pid

echo "All processes started."
