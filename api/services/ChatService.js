var chats = [];

module.exports = {
  getChats,
  addUserMessage
};

function getChats() {
  return chats;
}

function addUserMessage(chat) {
  if (!chat.username) {
    chat.username = 'Anonymous';
  }
  addMessage(chat);
}

function addMessage(chat) {
  chats.push(chat);
  sails.io.sockets.in('chatting').emit('chats', chats);
}
