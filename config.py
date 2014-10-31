dispatcher_url = "localhost"
dispatcher_port = 6666


# each node needs the following information: host, port, path to hyrise repository, coreoffset, number of cores to run on
cluster_nodes = [("localhost", 5000, "/home/Alexander.Franke/hyrise_nvm", 8, 8), 
                 ("localhost", 5001, "/home/Alexander.Franke/hyrise_nvm", 16, 8), 
                 ("localhost", 5002, "/home/Alexander.Franke/hyrise_nvm", 24, 8), 
                 ("localhost", 5003, "/home/Alexander.Franke/hyrise_nvm", 32, 8)]
master = 0
