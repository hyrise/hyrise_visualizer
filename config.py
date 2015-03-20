dispatcher_url = "localhost"
dispatcher_port = 6666


# each node needs the following information: host, port, path to hyrise repository, coreoffset, number of cores to run on
cluster_nodes = [("localhost", 5000, "/home/vagrant/hyrise_nvm", 0, 1), 
                 ("localhost", 5001, "/home/vagrant/hyrise_nvm", 1, 1), 
                 ("localhost", 5002, "/home/vagrant/hyrise_nvm", 2, 1), 
                 ("localhost", 5003, "/home/vagrant/hyrise_nvm", 3, 1)]
master = 0
