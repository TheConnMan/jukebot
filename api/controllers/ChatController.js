var typers = [];

module.exports = {
  subscribe(req, res) {
    if (req.session.passport) {
      User.findOne({
        id: req.session.passport.user
      }).then(user => {
        subscribe(req, res, user.name);
      });
    } else {
      subscribe(req, res, null);
    }
  }
};

function subscribe(req, res, user) {
  req.socket.join('chatting');
  ChatService.getChats().then((chats) => {
    sails.io.sockets.in('chatting').emit('chats', chats);
  });

  req.socket.on('chat', function(chat) {
    chat.realuser = user;
    ChatService.addUserMessage(chat);
  });

  req.socket.join('typers');

  req.socket.on('typers', function(data) {
    var index = typers.indexOf(data.username);
    if (data.typing && index === -1) {
      typers.push(data.username);
      sails.io.sockets.in('typers').emit('typers', typers);
    } else if (!data.typing && index !== -1) {
      typers.splice(index, 1);
      sails.io.sockets.in('typers').emit('typers', typers);
    }
  });
}
