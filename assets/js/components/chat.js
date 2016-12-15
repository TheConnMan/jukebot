function ChatController($scope, $http, $notification, $storage) {
  let self = this;
  let timer = null;

  io.socket.get('/chat/subscribe', {});

  $scope.chats = [];
  $scope.newChat = '';
  $scope.notifications = $storage.get('chat-notifications') === 'true' ||  !$storage.get('chat-notifications');

  $scope.differentUser = function(index) {
    return index === 0 || $scope.chats[index].time - $scope.chats[index - 1].time > 3 * 60 * 1000 || $scope.chats[index - 1].type === 'machine' || $scope.chats[index].username != $scope.chats[index - 1].username;
  };

  $scope.toggleChat = function(newVal) {
    $storage.set('chat-notifications', newVal);
  };

  $scope.sendChat = function() {
    io.socket._raw.emit('chat', {
      message: $scope.newChat,
      username: self.username,
      time: Date.now()
    });
    $('#chat-input input').val('');
    typing(false);
  };

  $scope.formatMessage = function(message) {
    let regex = new RegExp(`(^|\\b)([@]?${self.username})|(@here)|(@channel)(?=\\b|$)`, 'ig');
    return message.replace(regex, '<span class="highlight">$&</span>');
  };

  io.socket.on('chats', (c) => {
    $scope.chats = c;
    $scope.$digest();
    scrollChatToBottom();
  });

  io.socket.on('chat', (c) => {
    $scope.chats.push(c);
    if (c.username !== self.username && $scope.notifications && c.type !== 'video') {
      let notification = $notification(c.username || 'JukeBot', {
        body: c.message,
        delay: 4000,
        icon: '/images/jukebot-72.png',
        focusWindowOnClick: true
      });
      notification.$on('click', function () {
        $('#chat-input > input').focus();
      });
    }
    $scope.$digest();
    scrollChatToBottom();
  });

  $scope.$watch('newChat', function(val) {
    typing(true);
    clearTimeout(timer);
    timer = setTimeout(function() {
      typing(false);
    }, 3000);
  });

  function typing(isTyping) {
    io.socket._raw.emit('typers', {
      typing: isTyping,
      username: self.username
    });
  }

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
