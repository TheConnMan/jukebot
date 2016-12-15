function ChatController($scope, $http, $notification, $storage) {
  let self = this;
  let timer = null;

  io.socket.get('/chat/subscribe', {});

  this.chats = [];
  this.newChat = '';
  this.typers = '';
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
    typing(false);
  };

  this.formatMessage = function(message) {
    let regex = new RegExp(`(^|\\b)([@]?${this.username})|(@here)|(@channel)(?=\\b|$)`, 'ig');
    return message.replace(regex, '<span class="highlight">$&</span>');
  };

  io.socket.on('chats', (c) => {
    this.chats = c;
    $scope.$digest();
    scrollChatToBottom();
  });

  io.socket.on('chat', (c) => {
    this.chats.push(c);
    if (c.username !== this.username && this.notifications && c.type !== 'video') {
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

    io.socket.on('typers', (typers) => {
      if (typers.indexOf(self.username) !== -1) {
        typers.splice(typers.indexOf(self.username), 1);
      }
      if (typers.length === 0) {
        self.typers = '';
      } else if (typers.length === 1) {
        self.typers = typers[0] + ' is typing';
      } else if (typers.length === 2) {
        self.typers = typers.join(' and ') + ' are typing';
      } else {
        self.typers = 'Several people are typing';
      }
      $scope.$digest();
    });

  $('#chat-input > input').keyup(function() {
    typing(true);
    clearTimeout(timer);
    timer = setTimeout(function() {
      typing(false);
    }, 1000);
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
