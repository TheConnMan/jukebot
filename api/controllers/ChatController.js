var chats = [];

module.exports = {
  subscribe(req, res) {
    let params = req.allParams();
    req.socket.join('chatting');
  },

  new(req, res) {
    let chat = req.allParams();
    console.log(chat);
    chats.push(chat);

    res.send(204);
    sails.io.sockets.in('chatting').emit('chats', chats);
  }
};
