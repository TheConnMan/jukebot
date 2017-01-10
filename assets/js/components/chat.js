function ChatController($rootScope, $scope, $http, $notification, $storage, $video) {
  let self = this;
  let timer = null;

  io.socket.get('/chat/subscribe', {});

  $rootScope.$on('likeVideo', function(e, args) {
    io.socket._raw.emit('chat', {
      message: self.getUsername() + ' favorited ' + args.video.title,
      type: 'favorite',
      time: Date.now(),
      data: args.video.key
    });
  });

  this.chats = [];
  this.newChat = '';
  this.typers = '';
  this.notifications = $storage.get('chat-notifications') === 'true' ||  !$storage.get('chat-notifications');

  this.getUsername = function() {
    return self.username || 'Anonymous';
  };

  this.showUsername = function(index) {
    let isFirst = index === 0;
    if (isFirst) {
      return true;
    }
    let recentPreviousMessage = new Date(this.chats[index].time) - new Date(this.chats[index - 1].time) <= 3 * 60 * 1000;
    let differentUser = this.chats[index].username !== this.chats[index - 1].username;
    let differentChatType = this.chats[index].type !== this.chats[index - 1].type;
    let bothMachineChat = this.chats[index].type !== 'user' && this.chats[index - 1].type !== 'user';
    return (!recentPreviousMessage || differentUser || differentChatType) && !bothMachineChat;
  };

  this.toggleChat = function(newVal) {
    $storage.set('chat-notifications', newVal);
  };

  this.sendChat = function() {
    io.socket._raw.emit('chat', {
      message: this.newChat,
      username: this.getUsername(),
      type: 'user',
      time: Date.now()
    });
    $('#chat-input input').val('');
    this.newChat = '';
    typing(false);
  };

  this.typingDebounce = function() {
    typing(true);
    clearTimeout(timer);
    timer = setTimeout(function() {
      typing(false);
    }, 1000);
  };

  this.getTime = function(chat) {
    return new Date(chat.time).getTime();
  };

  this.getVideoByKey = function(key) {
    return $video.findByKey(key);
  };

  io.socket.on('chats', (c) => {
    this.chats = c;
    $scope.$digest();
    highlightChats();
    scrollChatToBottom();
  });

  io.socket.on('chat', (c) => {
    this.chats.push(c);
    if (c.username !== this.getUsername() && this.notifications && c.type !== 'video') {
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
    highlightChats();
    scrollChatToBottom();
  });

  function highlightChats() {
    let markOptions = {
      accuracy: 'exactly',
      className: 'highlight'
    };
    $('.chat').mark(self.getUsername(), markOptions);
    $('.chat').mark('@' + self.getUsername(), markOptions);
    $('.chat').mark('@here', markOptions);
    $('.chat').mark('@channel', markOptions);
  }

    io.socket.on('typers', (typers) => {
      if (typers.indexOf(self.getUsername()) !== -1) {
        typers.splice(typers.indexOf(self.getUsername()), 1);
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

  function typing(isTyping) {
    io.socket._raw.emit('typers', {
      typing: isTyping,
      username: self.getUsername()
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
