var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
let Nicks = ['','','','',''];
let Colours = ['','','','',''];
let ChatHistory = [{'nick':'test1', 'msgs':'', 'colour':'#000000'},
{'nick':'test2', 'msgs':'', 'colour':'white'},
{'nick':'test3', 'msgs':'', 'colour':'#000000'},
{'nick':'test4', 'msgs':'', 'colour':'#000000'}]
app.use(express.static  -09

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
http.listen(3000, function(){
  console.log('listening on *:3000');
});

Con1 = io.connect('localhost:3000', {resource: 'con1/socket.io', 'force new connection': true}); 
Con2 = io.connect('localhost:3000', {resource: 'con2/socket.io', 'force new connection': true}); 
Con3 = io.connect('localhost:3000', {resource: 'con3/socket.io', 'force new connection': true}); 
Con4 = io.connect('localhost:3000', {resource: 'con4/socket.io', 'force new connection': true});
Con5 = io.connect('localhost:3000', {resource: 'con4/socket.io', 'force new connection': true});
let Connections = [Con1,Con2,Con3,Con4,Con5];

//Function to randomly determin nick
function setNick(con, i){
	let nic = (Math.random() + 1).toString(36).substring(7); 
	while (nic in Nicks) {
  		nic = (Math.random() + 1).toString(36).substring(7);

  		let match = false;
  		if (ChatHistory.length > 0){
  			let i = 0;
  			while(i<ChatHistory.length){
  				if(ChatHistory[i]['nick'] === nic){
  					match = true;
  					break;
  				}
  			}
  		}

  		if (match) {continue;}
  	}

  	Nicks[i] = nic;
  	con.emit('nick', nic);
  	console.log('a user connected: '+nic);
}


function getNickPosition(nick){
	return Nicks.indexOf(nick);
}

function isNickInHistory(nick){
	let i = 0;
}

io.on('connection', function(socket){
  //Assign unique Nick to empty connection
  let found = false; 
  let i = 0;
  while (!found || i < 5){
  	if (Nicks[i] == ''){
  		setNick(Connections[i], i)
  		found = true;
  		break;
  	}
  	i = i +1;
  }
  console.log('Nicks: ', Nicks);
  //Send all nicks to every connection
  io.emit('online users', {'n':Nicks, 'c':Colours})

  socket.on('chat message', function(msg){
    console.log('message: ', msg);
    let dnow = new Date(Date.now())
  	let time = dnow.getHours()+":"+dnow.getMinutes();
  	let newMsg = {
  		'msg': msg['msg'],
  		'nick': msg['nick'],
  		'colour':msg['colour'],
  		'time': time
  	};
    io.emit('chat message', newMsg);
  });

  socket.on('nick change', function(msg){
  	//find nick and replace with newNick if unique
  	//broadcast Nicks list and colours
  	// send notification
  });

  socket.on('nick login', function(msg){
  	//find nick in history
  	//broadcast Nicks list and colours
  	// send notification
  });

  socket.on('nick colour', function(msg){
  	//find nick and get index
  	//replace colour at index
  	//Broadcast Nicks and Colours
  	// send notification
  });

  socket.on('disconnect', function(){
  	//store messages and nick and colour
    console.log('user disconnected');
  });

  socket.on('exit', function(msg){
  	let nickToErase = msg['nick'];
  	//find nick in Nicks and history

  	//store messages and nick and colour
  	ChatHistory.push(msg)
    console.log('user disconnected');
  });

});


// send event to everyone: io.emit('some event', { for: 'everyone' });
// send to everyone except certain sockets:
//io.on('connection', function(socket){
  //socket.broadcast.emit('hi');
//});


