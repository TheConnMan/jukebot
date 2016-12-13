var chats = [];

module.exports = {
  getChats,
  addUserMessage,
  addVideoMessage,
  playingVideoMessage
};

function getChats() {
  return chats;
}

function addUserMessage(chat) {
  if (!chat.username) {
    chat.username = 'Anonymous';
  }
  chat.type = 'user';
  addMessage(chat);
}

function addVideoMessage(video) {
  var chat = {
    message: video.title + ' was added to the playlist by ' + video.user,
    type: 'machine',
    time: Date.now()
  };
  addMessage(chat);
}

function playingVideoMessage(video) {
  var chat = {
    message: video.title + ' is now playing',
    type: 'machine',
    time: Date.now()
  };
  addMessage(chat);
}

function addMessage(chat) {
  chats.push(chat);
  sails.io.sockets.in('chatting').emit('chats', chats);
}
