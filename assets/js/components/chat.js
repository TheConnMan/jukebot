function ChatController($scope, $http) {
  io.socket.get('/chat/subscribe', {});

  this.chats = [];
  this.newChat = '';

  this.differentUser = function(index) {
    return index === 0 || this.chats[index].username != this.chats[index - 1].username;
  };

  this.sendChat = function() {
    $http
     .post('/chat/new', {
        message: this.newChat,
        username: this.username,
        time: Date.now()
      })
      .then(() => $('#chat-input input').val(''));
  };

  io.socket.on('chats', (c) => {
    this.chats = c;
    $scope.$digest();
    scrollChatToBottom();
  });

  function scrollChatToBottom() {
    let $list = $('#chat-list');
    $list.animate({
     scrollTop: $list.prop('scrollHeight')
    }, 1000);
  };
}

angular
.module('app')
.component('chat', {
  templateUrl: 'components/chat.html',
  controller: ChatController,
  bindings: {
    username: '='
  }
});
