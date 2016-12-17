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
  if (!chat.username) {
    chat.username = 'Anonymous';
  }
  chat.type = 'user';
  addMessage(chat);
}

function addMachineMessage(message) {
  var chat = {
    message: message,
    type: 'machine',
    time: Date.now()
  };
  addMessage(chat);
}

function addVideoMessage(message) {
  var chat = {
    message: message,
    type: 'video',
    time: Date.now()
  };
  addMessage(chat);
}

function addMessage(chat) {
  Chat.create(chat)
    .then((c) => {
      sails.io.sockets.in('chatting').emit('chat', c);
    })
    .catch((e) => console.log(e));
}
