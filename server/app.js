var PROTO_PATH = __dirname + '/protos/chat.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync (PROTO_PATH);
var chat_proto = grpc.loadPackageDefinition (packageDefinition).chat;

var clients = {
}

function sendMessage(call) {
  call.on('data', function(chat_message) {

    if (!(chat_message.name in clients)) {
      clients [chat_message.name] = {
        name: chat_message.name,
        call: call
      }
    }

    for (var client in clients) {
      clients [client].call.write(
        {
          name: chat_message.name,
          message: chat_message.message
        }
      )
    }
  });
  call.on('end', function() {
    call.end();
  });

  call.on('error', function(e) {
    console.log(e)
  });

}


var server = new grpc.Server();
server.addService(chat_proto.ChatService.service, {
  sendMessage:sendMessage
});
server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), function() {
  server.start()
})
