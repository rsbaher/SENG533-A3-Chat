var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
let Nicks = ['','','','',''];
let Colours = ['','','','',''];
let ChatHistory = [{'nick':'test1', 'msgs':'', 'colour':'#000000'},
{'nick':'test2', 'msgs':'', 'colour':'white'},
{'nick':'test3', 'msgs':'', 'colour':'#000000'},
{'nick':'test4', 'msgs':'', 'colour':'#000000'}]
app.use(express.static(path.join(__dirname, '/')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
http.listen(3000, function(){
  console.log('listening on *:3000');
});

/*Con1 = io.connect('localhost:3000', {resource: 'con1/socket.io', 'force new connection': true}); 
Con2 = io.connect('localhost:3000', {resource: 'con2/socket.io', 'force new connection': true}); 
Con3 = io.connect('localhost:3000', {resource: 'con3/socket.io', 'force new connection': true}); 
Con4 = io.connect('localhost:3000', {resource: 'con4/socket.io', 'force new connection': true});
Con5 = io.connect('localhost:3000', {resource: 'con4/socket.io', 'force new connection': true});
let Connections = [Con1,Con2,Con3,Con4,Con5];*/

//Function to randomly determin nick
function setNick(nic, i){
  	Nicks[i] = nic;
  	console.log('a user connected: '+nic);
}


function getNickPosition(nick){
	return Nicks.indexOf(nick);
}

// -1 means not in history
function isNickInHistory(nick){
	let i = 0;
	while (i < ChatHistory.length){
		if (ChatHistory[i]['nick'] === nick){
			return i;
		}
	}
	return -1;
}



io.on('connection', function(socket){
  //Assign unique Nick to empty connection
 
  socket.on('start', function(msg){
  	let i = 0;
  	while (i < 5){
  		if (Nicks[i] == ''){
  			setNick(msg, i)
  			break;
  		}
  		i = i +1;
  	}
  	console.log('Nicks: ', Nicks);
  	//Send all nicks to every connection
  	io.emit('online users', {'n':Nicks, 'c':Colours})
  	io.emit('notification', "New User Connected!");
  });
  
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
  	let old = msg['nick'];
  	let newNick = msg['newNick'];
  	let index = getNickPosition(old);
  	let histIndx = isNickInHistory(old);
  
  	if (histIndx !== -1){
  		ChatHistory[i]['nick'] = newNick
  	}
  	Nicks[index] = newNick
  	//broadcast Nicks list and colours
  	socket.emit('online users', {'n':Nicks, 'c':Colours});
  	// send notification
  	socket.emit(old+' nick', newNick);
  });

  socket.on('nick login', function(msg){
  	//find nick in history
  	let currNick = msg['nick'];
  	let currNickIndex = getNickPosition(currNick);
  	let LogNick = msg['nickL'];
  	let histIndx = isNickInHistory(LogNick);
  	let m = '';
  	if (histIndx !== -1){
  		//broadcast Nicks list and colours
  		Nicks[currNickIndex] = LogNick;
  		socket.emit('online users', {'n':Nicks, 'c':Colours});
  		// send notification
  		socket.emit(currNick+' login success', ChatHistory[histIndx]);
  		m = "Successful Login with: "+LogNick;
  		socket.emit(currNick+' notification', m);
  	} else {
  		m = "Could not login with nick: "+LogNick;
  		socket.emit(currNick+' notification', m);
  	}
  	
  	
  });

  socket.on('nick colour', function(msg){
  	//find nick and get index
  	let index = getNickPosition(msg['nick']);
  	let col = msg['colour'];
  	//replace colour at index
  	Colours[index] = col;
  	//Broadcast Nicks and Colours
  	socket.emit('online users', {'n':Nicks, 'c':Colours});
  	socket.emit(msg['nick']+' colour', col);
  	// send notification
  	let m = "Changed Colour to: "+col;
  	socket.emit(msg['nick']+' notification', m);
  });

  socket.on('disconnect', function(){
  	//store messages and nick and colour
    console.log('user disconnected');
  });

  socket.on('exit', function(msg){
  	let nickToErase = msg['nick'];
  	//find nick in Nicks and history
  	let histIndx = isNickInHistory(nickToErase);
  	//Update info
  	if (histIndx !== -1){
  		ChatHistory[histIndx]['colour'] = msg['colour'];
  		ChatHistory[histIndx]['msgs'] = msg['msgs'];
  	} else{
  		//store messages and nick and colour
  		ChatHistory.push(msg);
  	}
  	let i = getNickPosition(nickToErase);
  	Nicks[i] = '';
    console.log('user exited');
  });

});


// send event to everyone: io.emit('some event', { for: 'everyone' });
// send to everyone except certain sockets:
//io.on('connection', function(socket){
  //socket.broadcast.emit('hi');
//});


