module.exports = {
  subscribe(req, res) {
    req.socket.join('chatting');
    sails.io.sockets.in('chatting').emit('chats', ChatService.getChats());

    req.socket.on('chat', function(chat) {
      ChatService.addUserMessage(chat);
    });
  }
};
