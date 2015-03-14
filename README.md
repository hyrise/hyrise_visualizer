hyrise_visualizer
=================

Explorative user interface for HYRISE based on JavaScript

## Installation

The system we use is based on two servers. One local server to host the web-based frontend (web server) and one remote server for the database instances to run on (database server).
The named components reference repositories from the [Hyrise Organization](https://github.com/hyrise) on Github.

###Database Server Setup

 1. Clone hyrise_nvm repository
 2. change settings.mk and build
    Persistency:BUFFEREDLOGGER
    Replication:1
 3. Clone dispatcher and built
 4. Clone hyrise_visualizer to get the scripts
 5. Clone benchmark and built Apache Benchmark Tool (ab)

###Web Server Setup

 1. Install python and [pip](https://pip.pypa.io/en/latest/installing.html)
 2. Use pip to install cherrypy
 3. Clone hyrise_visualizer
 4. On Windows also install [PuTTY](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html) and [Plink](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html) for the SSH connection
 5. Start web server by executing run.py
 6. Your webservice will run at http://localhost:8000.

###Connection Setup
 
 1. Save the public key in ~\.ssh\authorized_keys on the database server
 2. Make a connection from the web server to the database server using ssh with the private key
 3. Save the session with the database server host as name, e.g. chemnitz.eaalab.hpi.uni-potsdam.de

## Other

color theme: https://kuler.adobe.com/Theme-3-color-theme-2520058/
API documentation for the test framework: http://chaijs.com/api/assert/
