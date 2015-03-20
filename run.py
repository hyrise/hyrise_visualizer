#!/usr/bin/env python
import json
import os
import os.path, time
import cherrypy
import random
from subprocess import call
import requests

if os.name == 'nt':
    remote = "plink"
else:
    remote = "ssh"

def getConfig():
    json_file = open('config.json')
    data = json.load(json_file)
    json_file.close()
    return data

class MyServerHandler(object):

    @cherrypy.expose
    def index(self):
        with open("index.html") as f:
            content = f.readlines()
            return content

    @cherrypy.expose
    def delay(self):
        config = getConfig();
        payload = {'query': '{"operators": {"0": {"type": "ClusterMetaData"} } }'}
        r = requests.post("http://%s:%d/query/" % (config["nodes"][config["master"]]["host"], config["nodes"][config["master"]]["port"]), data=payload)
        return r.text

    @cherrypy.expose
    def QueryData(self):
        config = getConfig();
        payload = {'data':0}
        try:
            r = requests.post("http://%s:%d/statistics" % (config["dispatcher"]["host"], config["dispatcher"]["port"]), data=payload, stream=True)
            return '{"data":' + r.text + '}'
        except Exception as e:
            return str(e)

    @cherrypy.expose
    def startserver(self):
        config = getConfig();
        call([remote, config["nodes"][config["master"]]["host"], "hyrise_visualizer/scripts/start.sh", str(config["nodes"][0]["cpu"]), str(config["nodes"][1]["cpu"]), str(config["nodes"][2]["cpu"]), str(config["nodes"][3]["cpu"])])
        return ""

    @cherrypy.expose
    def killmaster(self):
        config = getConfig();
        call([remote, config["nodes"][config["master"]]["host"], "hyrise_visualizer/scripts/killmaster.sh"])
        return ""

    @cherrypy.expose
    def killall(self):
        config = getConfig();
        call([remote, config["nodes"][config["master"]]["host"], "hyrise_visualizer/scripts/end.sh"])
        return ""

    @cherrypy.expose
    def readworkload(self):
        config = getConfig();
        call([remote, config["nodes"][config["master"]]["host"], "hyrise_visualizer/scripts/workload_read.sh", "10"])
        return ""

    @cherrypy.expose
    def writeworkload(self):
        config = getConfig();
        call([remote, config["nodes"][config["master"]]["host"], "hyrise_visualizer/scripts/workload_write.sh", "10"])
        return ""

    @cherrypy.expose
    def startworkload(self):
        config = getConfig();
        call([remote, config["nodes"][config["master"]]["host"], "hyrise_visualizer/scripts/workload_start.sh", "3", "3"])
        return ""

    @cherrypy.expose
    def endworkload(self):
        config = getConfig();
        call([remote, config["nodes"][config["master"]]["host"], "hyrise_visualizer/scripts/workload_end.sh"])
        return ""

    @cherrypy.expose
    def useonereplica(self):
        config = getConfig();
        payload = {"data":0}
        r = requests.post("http://%s:%d/number_of_slaves_1" % (config["dispatcher"]["host"], config["dispatcher"]["port"]), data=payload)
        return r.text

    @cherrypy.expose
    def usetworeplica(self):
        config = getConfig();
        payload = {"data":0}
        r = requests.post("http://%s:%d/number_of_slaves_2" % (config["dispatcher"]["host"], config["dispatcher"]["port"]), data=payload)
        return r.text

    @cherrypy.expose
    def usethreereplica(self):
        config = getConfig();
        payload = {"data":0}
        r = requests.post("http://%s:%d/number_of_slaves_3" % (config["dispatcher"]["host"], config["dispatcher"]["port"]), data=payload)
        return r.text

    @cherrypy.expose
    def saveConfig(self, data):
        with open('config.json','w') as outfile:
            json.dump(json.loads(data), outfile)

    @cherrypy.expose
    def loadConfig(self):
        config = getConfig()
        return json.dumps(config)

    @cherrypy.expose
    def SystemStats(self):
        config = getConfig();
        payload = {'query': '{"operators": {"0": {"type": "SystemStats"} } }'}
        aStats = []
        try:
            for idx, node in enumerate(config["nodes"]):
                r = requests.post("http://%s:%d/query/" % (node["host"], node["port"]), data=payload)
                result = json.loads(r.text)
                oStats = { 'id': idx, 'cpu':[], 'net':{}, 'mem':{}}
                for row in result['rows']:
                    if row[0] == 'cpu':
                        oStats['cpu'].append({'id':row[1], 'user':row[3], 'nice':row[4], 'system':row[5], 'idle':row[6]})
                    elif row[0] == 'network':
                        oStats['net']['id'] = row[1]
                        oStats['time'] = row[2]
                        oStats['net']['received'] = row[3]
                        oStats['net']['send'] = row[4]
                    elif row[0] == 'memory':
                        if row[1] == 'MemTotal':
                            oStats['mem']['total'] = row[3]
                        elif row[1] == 'MemFree':
                            oStats['mem']['free'] = row[3]
                aStats.append(oStats)

            return json.dumps(aStats)
        except Exception as e:
            return str(e)


        


if __name__ == '__main__':

    random.seed()

    conf = {
        '/': {'tools.staticdir.on': True, 'tools.staticdir.dir': os.path.abspath('./')},
        #"server.logToScreen" : False,
        '/css': {'tools.staticdir.on': True, 'tools.staticdir.dir': os.path.abspath('./css')}
        }

    cherrypy.config.update({
                'server.socket_host': '127.0.0.1',
                'server.socket_port': 8000,
     })
    cherrypy.config.update({ "server.logToScreen" : False })
    #cherrypy.config.update({'log.screen': False})
    # cherrypy.config.update({ "environment": "embedded" })

    cherrypy.quickstart(MyServerHandler(), '/', conf)

    # print create_json_from_ab("Reads")
