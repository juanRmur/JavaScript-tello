//COMUNICACIÓN DRON
const dgram = require('dgram');
const app = require('express');
const http = require('http').Server(app);
const io = require('socket.io')(http);

//STREAMING
const http2 = require('http');
const WebSocket = require('ws');
const spawn = require('child_process').spawn;

//Conexion con el dron y comunicación
const PUERTO = 8889;
const IpDron = '192.168.10.1';
const dron = dgram.createSocket('udp4');
dron.bind(PUERTO);


dron.on('message', message => {
  console.log(`Tello : ${message}`);
  io.sockets.emit('status', message.toString());
});

//Enviamos el comando "command" para poner el dron en modo SDK (modo comandos)

dron.send('command', 0, 'command'.length, PUERTO, IpDron, null);


//Comandos recibidos desde el navegador
io.on('connection', socket => {
  socket.on('command', command => {
    console.log('Comando recibido desde el navegador: ' + command);
    dron.send(command, 0, command.length, PUERTO, IpDron, null);
  });
});

//Puerto por donde escucha socket.io
http.listen(6767, () => {
  console.log('Servidor socket io encendido');
});


// ---------STREAMING VIDEO --------- //

// Enviamos el comando para encender la cámara
dron.send('streamon', 0, 'streamon'.length, PUERTO, IpDron, null);

//Servidor que recibe el vídeo de la cámara
const streamServer = http2.createServer(function(request, response) {
  
  //Cuando el vídeo venga de FFmpeg, se lo pasamos al socket web
  request.on('data', function(data) {
    //Ahora el vídeo se lo pasamos al servidor web socket
    webSocketServer.broadcast(data);
  });

}).listen(3001);

// Servidor Web Socket
const webSocketServer = new WebSocket.Server({
  server: streamServer
});

// Enviamos el stream (video) al cliente
webSocketServer.broadcast = function(data) {
  webSocketServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Después de 2 segundos iniciamos FFmpeg
setTimeout(function() {
  var args = [
    "-i", "udp://0.0.0.0:11111", //Puerto por donde envía el vídeo el dron
    "-r", "30",  //FPS
    "-s", "500x360", //Resoluciñon
    "-codec:v", "mpeg1video", //Codec
    "-b", "800k",  //Bitrate
    "-f", "mpegts", //Formato de video
    "http://127.0.0.1:3001/stream"
  ];

  // Creamos el objeto FFmpeg
  var streamer = spawn('ffmpeg', args);
  
  streamer.on("exit", function(code){
  });
}, 2000);