var http = require('http');
var hyrise = require('./hyrise.js');

var spawn = require('child_process').spawn;
var ls = spawn('ls', ['-lh', '/usr']); // runs the 'ls -lh /usr' shell cmd

ls.stdout.on('data', function(data) { // handler for output on STDOUT
  console.log('stdout: '+data);
});

ls.stderr.on('data', function(data) { // handler for output on STDERR
  console.log('stderr: '+data);
});

ls.on('exit', function(code) { // handler invoked when cmd completes
  console.log('child process exited with code '+code);
});

var server = http.createServer(function(req, res) {
	res.writeHead(200);
	res.end(hyrise.hello());
});
server.listen(8888);