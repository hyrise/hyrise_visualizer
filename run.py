#!/usr/bin/env python
import SimpleHTTPServer
import BaseHTTPServer
import SocketServer
import json
import os
import pandas as pd
import math
import numpy as np
from functools import partial
import os.path, time
import cherrypy
import random
from subprocess import call
import requests
import psutil

import config

class MyServerHandler(object):
    @cherrypy.expose
    def index(self):
        with open("index.html") as f:
            content = f.readlines()
            return content
    
    @cherrypy.expose
    def delay(self):
        payload = {'query': '{"operators": {"0": {"type": "ClusterMetaData"} } }'}
        r = requests.post("http://%s:%d/query/" % (config.cluster_nodes[config.master][0], config.cluster_nodes[config.master][1]), data=payload)
        return r.text

    @cherrypy.expose
    def load(self):
        l = psutil.cpu_percent(interval=0, percpu=True)
        return """{"0": [%d, %d, %d, %d, %d, %d, %d, %d], "1": [%d, %d, %d, %d, %d, %d, %d, %d], "2": [%d, %d, %d, %d, %d, %d, %d, %d], "3": [%d, %d, %d, %d, %d, %d, %d, %d] }""" % (l[16], l[18], l[20], l[22], l[24], l[26], l[28], l[30], l[32], l[34], l[36], l[38], l[40], l[42], l[44], l[46], l[48], l[50], l[52], l[54], l[56], l[58], l[60], l[62], l[64], l[66], l[68], l[70], l[72], l[74], l[76], l[78] )

    @cherrypy.expose
    def QueryData(self):
        payload = {'data':0}
        r = requests.post("http://%s:%d/statistics" % (config.dispatcher_url, config.dispatcher_port), data=payload, stream=True)
        return '{"data":' + r.text + '}' 

    @cherrypy.expose
    def startserver(self):
        call(["bash", "start.sh"])
        return ""

    @cherrypy.expose
    def killmaster(self):
        call(["bash", "killmaster.sh"])
        return ""

    @cherrypy.expose
    def killall(self):
        call(["bash", "end.sh"])
        return ""

    @cherrypy.expose
    def readworkload(self):
        call(["bash", "workload_read.sh"])
        return ""

    @cherrypy.expose
    def writeworkload(self):
        call(["bash", "workload_write.sh"])
        return ""

    @cherrypy.expose
    def useonereplica(self):
        payload = {"data":0}
        r = requests.post("http://%s:%d/number_of_slaves_1" % (config.dispatcher_url, config.dispatcher_port), data=payload)
        return r.text

    @cherrypy.expose
    def usetworeplica(self):
        payload = {"data":0}
        r = requests.post("http://%s:%d/number_of_slaves_2" % (config.dispatcher_url, config.dispatcher_port), data=payload)
        return r.text

    @cherrypy.expose
    def usethreereplica(self):
        payload = {"data":0}
        r = requests.post("http://%s:%d/number_of_slaves_3" % (config.dispatcher_url, config.dispatcher_port), data=payload)
        return r.text

  
if __name__ == '__main__':

    random.seed()
    
    conf = {
        '/': {'tools.staticdir.on': True, 'tools.staticdir.dir': os.path.abspath('./')},
        #"server.logToScreen" : False,
        '/css': {'tools.staticdir.on': True, 'tools.staticdir.dir': os.path.abspath('./css')}
        }

    cherrypy.config.update({
                'server.socket_host': '192.168.30.112',
                'server.socket_port': 8000,
     })
    #cherrypy.config.update({ "server.logToScreen" : False })
    #cherrypy.config.update({'log.screen': False})
    # cherrypy.config.update({ "environment": "embedded" })
        
    cherrypy.quickstart(MyServerHandler(), '/', conf)

    # print create_json_from_ab("Reads")
