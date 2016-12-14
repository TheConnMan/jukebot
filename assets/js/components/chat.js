function ChatController($scope, $http, $notification, $storage) {
  io.socket.get('/chat/subscribe', {});

  this.chats = [];
  this.newChat = '';
  this.notifications = $storage.get('chat-notifications') === 'true' ||  !$storage.get('chat-notifications');

  this.differentUser = function(index) {
    return index === 0 || this.chats[index].time - this.chats[index - 1].time > 3 * 60 * 1000 || this.chats[index - 1].type === 'machine' || this.chats[index].username != this.chats[index - 1].username;
  };

  this.toggleChat = function(newVal) {
    $storage.set('chat-notifications', newVal);
  };

  this.sendChat = function() {
    io.socket._raw.emit('chat', {
      message: this.newChat,
      username: this.username,
      time: Date.now()
    });
    $('#chat-input input').val('');
  };

  io.socket.on('chats', (c) => {
    this.chats = c;
    $scope.$digest();
    scrollChatToBottom();
  });

  io.socket.on('chat', (c) => {
    this.chats.push(c);
    if (c.username !== this.username && this.notifications && c.type !== 'video') {
      $notification(c.username || 'JukeBot', {
        body: c.message,
        delay: 4000,
        icon: '/images/jukebot-72.png',
        focusWindowOnClick: true
      });
    }
    $scope.$digest();
    scrollChatToBottom();
  });

  function scrollChatToBottom() {
    let $list = $('#chat-list');
    $list.animate({
     scrollTop: $list.prop('scrollHeight')
    }, 1000);
  }
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
