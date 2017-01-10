var log4js = require('log4js');
var logger = log4js.getLogger();

module.exports = {
  getChats,
  addUserMessage,
  addMachineMessage,
  addVideoMessage
};

function getChats() {
  return Chat.find();
}

function addUserMessage(chat) {
  chat.time = new Date(chat.time).toISOString();
  addMessage(chat);
}

function addMachineMessage(message, username) {
  var chat = {
    message: message,
    type: 'machine',
    username: username,
    time: new Date().toISOString()
  };
  addMessage(chat);
}

function addVideoMessage(message) {
  var chat = {
    message: message,
    type: 'video',
    time: new Date().toISOString()
  };
  addMessage(chat);
}

function addMessage(chat) {
  Chat.create(chat)
    .then((c) => {
      sails.io.sockets.in('chatting').emit('chat', c);
    })
    .catch((e) => logger.warn(e));
}
