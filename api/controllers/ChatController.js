module.exports = {
  subscribe(req, res) {
    req.socket.join('chatting');
    sails.io.sockets.in('chatting').emit('chats', ChatService.getChats());
  },

  new(req, res) {
    let chat = req.allParams();

    ChatService.addUserMessage(chat);
    res.send(204);
  }
};
