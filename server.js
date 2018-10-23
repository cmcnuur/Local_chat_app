var express= require('express');
var socket=require('socket.io');
//const mongoose=require('mongoose');
//app setup
var app=express();
var server= app.listen(process.env.PORT || 5000,function(){
    console.log('listening to port 5000');
});

const mongo = require('mongodb').MongoClient;
const client = socket(server);
//static file
app.use(express.static('public'));
/*app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });*/

// Connect to mongo

mongo.connect('mongodb://admin:admin834200@ds249372.mlab.com:49372/mongochat',function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    // Connect to Socket.io
    client.on('connection', function(socket){
        console.log('made socket connection.....',socket.id)
        let chat = db.collection('chats');

        app.get('/', function(req, res){
            res.sendFile(__dirname + '/index.html');
          });

        // Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            // Emit the messages
            socket.emit('output', res);
        });

        
        // Handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            // Check for name and message
            if(name == '' || message == ''){
                // Send error status
              //sendStatus('Please enter a name and message');
            
            } else {
                // Insert message
                chat.insert({name:name, message: message}, function(){
                    client.emit('output', [data]);

                   
                });
            }

           

        });
  

        socket.on('typing',function(data){
            socket.broadcast.emit('typing',data)
        })

        // Handle clear
        socket.on('clear', function(data){
            // Remove all chats from collection
            chat.remove({}, function(){
                // Emit cleared
                socket.emit('cleared');
            });
        });
       
    });
});