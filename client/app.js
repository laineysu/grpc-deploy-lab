var readline = require('readline');
var readlineSync= require('readline-sync')
var PROTO_PATH = __dirname + '/protos/chat.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var packageDefinition = protoLoader.loadSync (PROTO_PATH);
var chat_proto = grpc.loadPackageDefinition(packageDefinition).chat;

var client = new chat_proto.ChatService('localhost:40000', grpc.credentials.createInsecure());

var name = readlineSync.question ("What is your name?")
var call = client.sendMessage();

call.on('data', function(resp) {
  console.log(resp.name + ": " + resp.message)
});
call.on('end', function() {

});
call.on("error", function(e) {
  console.log("Cannot connect to chat server")
})

call.write({
  message: name + " joined the chatroom",
  name: name
});

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


rl.on("line", function (message) {
  if (message.toLowerCase() === "quit") {
    call.write({
      message: name + " left the chatroom",
      name: name
    });
    call.end();
    rl.close();
  } else {
      call.write({
        message: message,
        name: name
      });
  }
});
