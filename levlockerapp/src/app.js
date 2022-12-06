var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('index.html');


const twilio = require('twilio');

const accountSid = ''; // Your Account SID from www.twilio.com/console
const authToken = ''; // Your Auth Token from www.twilio.com/console
const client = new twilio(accountSid, authToken);

var SerialPort = require('serialport');
const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
    delimiter: '\r\n'
});

var port = new SerialPort('/dev/cu.usbserial-0001', { 
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

port.pipe(parser);

var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

var io = require('socket.io').listen(app);

io.on('connection', function(socket) {
    
    console.log('Node is listening to port');
    
});

// To prevent calling twice in a row to the owner
var called = false;

parser.on('data', function(data) {
    
    console.log('Received data from port: ' + data);

    if (!called && JSON.parse(data).temperature > 50) {
        called = true;

        client.calls
        .create({
           twiml: '<Response><Say>LevLocker alert!</Say></Response>',
           to: '+',
           from: '+'
         }, function (err, call) {
            if (err) {
                console.log(err);
            } else {
                console.log(call.sid);
            }
         })
    }
    
    io.emit('data', data);
    
});

app.listen(3000);
