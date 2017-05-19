function ChatController($rootScope, $scope, $http, $notification, $storage, $video) {

  var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])\.(gif|png|jpg)/ig;

  let self = this;
  let timer = null;

  io.socket.get('/chat/subscribe', {});

  $rootScope.$on('likeVideo', function(e, args) {
    io.socket._raw.emit('chat', {
      message: ($rootScope.profile.username || 'Anonymous') + ' favorited ' + args.video.title,
      type: 'favorite',
      time: Date.now(),
      data: args.video.key
    });
  });

  this.chats = [];
  this.newChat = '';
  this.typers = '';

  this.getChats = function() {
    return this.chats.filter(function(chat) { return new Date(chat.createdAt) >= new Date(Date.now() - chatHistory * 60 * 1000); });
  };

  this.showUsername = function(chat) {
    var index = this.chats.indexOf(chat);

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

  this.getImages = function(chat) {
    return chat.message.match(urlRegex) || [];
  };

  this.furlChat = function(chat, furled) {
    chat.furled = furled;
  };

  this.sendChat = function() {
    if (this.newChat) {
      io.socket._raw.emit('chat', {
        message: this.newChat,
        username: $rootScope.profile.username,
        type: 'user',
        time: Date.now()
      });
      $('#chat-input input').val('');
      this.newChat = '';
      typing(false);
    }
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
    if (c.username !== $rootScope.profile.username && $rootScope.profile.chatNotifications && c.type !== 'addVideo' && c.type !== 'videoSkipped' && c.type !== 'videoPlaying') {
      let notification = $notification(c.username || 'Anonymous', {
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
    $('.chat > span').mark($rootScope.profile.username, markOptions);
    $('.chat > span').mark('@' + $rootScope.profile.username, markOptions);
    $('.chat > span').mark('@here', markOptions);
    $('.chat > span').mark('@channel', markOptions);
  }

    io.socket.on('typers', (typers) => {
      if (typers.indexOf($rootScope.profile.username) !== -1) {
        typers.splice(typers.indexOf($rootScope.profile.username), 1);
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
      username: $rootScope.profile.username
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
  controller: ChatController
});
