var chats = [];

module.exports = {
  subscribe(req, res) {
    let params = req.allParams();
    req.socket.join('chatting');
    sails.io.sockets.in('chatting').emit('chats', chats);
  },

  new(req, res) {
    let chat = req.allParams();

    if (!chat.username) {
      chat.username = 'Anonymous';
    }

    chats.push(chat);

    res.send(204);
    sails.io.sockets.in('chatting').emit('chats', chats);
  }
};
