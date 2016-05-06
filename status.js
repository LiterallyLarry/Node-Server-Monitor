var net = require('net');
var chalk = require('chalk');
var servercfg = require(__dirname+'/servers.json');
var port = 1337;  

var Server = function (private_name,public_name,port) {
this.private_name = private_name;
this.public_name = public_name;
this.port = port;
this.status = "WAIT";
this.change = false;
this.checked = false;
this.attempts = 0;
};

function check_port(server_object) {
var ps = new net.Socket();
server_object.checked = false;
ps.setTimeout(1000, function() {
	if (!server_object.checked) {
		console.log(chalk.red("DOWN: "+server_object.public_name+" ("+server_object.private_name+")"));
		if (server_object.status != "DOWN") {server_object.change = true;}
		else {server_object.change = false;};
		server_object.status = "DOWN";
		server_object.attempts += 1;
	}
	ps.destroy();
});
ps.connect(server_object.port, server_object.private_name, function() {
	server_object.checked = true;
	console.log(chalk.green("UP: "+server_object.public_name+" ("+server_object.private_name+")"));
	if (server_object.status != "UP") { server_object.change = true;}
	else { server_object.change = false; };
	server_object.status = "UP";
	server_object.attempts = 0;
});
ps.on('data', function(data) {
	ps.destroy();
});
ps.on('error', function(e) {
	server_object.checked = true;
	console.log(chalk.red("DOWN: "+server_object.public_name+" ("+server_object.private_name+")"));
	if (server_object.status != "DOWN") {server_object.change = true;}
	else {server_object.change = false;};
	server_object.status = "DOWN";
	server_object.attempts += 1;
	ps.destroy();
});
}

var fs = require('fs'),
    swig  = require('swig'),  
    http = require('http'),
    https = require('https'),
    express = require('express');

var options = {
    // If you want to run this server with SSL, uncomment and replace these lines with your SSL certificate paths
    //key: fs.readFileSync('/etc/ssl/server.key'),
    //cert: fs.readFileSync('/etc/ssl/server.pem'),
};
    

var app = express(),  
    io = require('socket.io').listen(https.createServer(options,app).listen(port));  
 
    app.engine('html', swig.renderFile);  
    app.set('view engine', 'html');  
    app.set('views', __dirname);  

    app.set('view cache', false);  
    swig.setDefaults({ cache: false });
    app.use('/images', express.static('images'));
    app.get('/', function (req, res) {  
      res.render('template.html', {
        // Change the page title name
		pagetitle: 'Example Server Status Page',
		serverobjects: server_array
	});
        
    });

var server_array = new Array();

for (var key in servercfg.servers) {
server_array.push(new Server(servercfg.servers[key].private_name,servercfg.servers[key].public_name,servercfg.servers[key].port));
}

function server_check() {
console.log(chalk.yellow("Checking server status:"));
for (var i = 0; i < server_array.length; i++) {
if (server_array[i].attempts < 10) {check_port(server_array[i]);}
else {console.log("Max attempts reached for "+server_array[i].private_name);};
if (server_array[i].change) {
var server_id = 'server_'+i;
io.emit('server_status', {'msg':[server_id.toString(),server_array[i].status,server_array.length]});
}
}
setTimeout(server_check, 30000);
}
server_check();
  
io.sockets.on('connection', function (socket) {  
  console.log(chalk.cyan('Client is connected to WebSocket'));
  socket.emit('server_connection',{'msg':'OK'});
  socket.emit('server_count',{'msg':server_array.length});
  for (var i = 0; i < server_array.length; i++) {
	var server_id = 'server_'+i;
	socket.emit('server_status', {'msg':[server_id.toString(),server_array[i].status,server_array.length]});
  }
});
