/*!
 * Sample.js - Sends tracking events to 5d's analytics service. v0.0.1
 * http://www.5dlab.com
 *
 * Copyright (c) 2014-2014, Sascha Lange, João Alves
 * Licensed under the MIT License.
 *
 */



(function (window, undefined) {

  var endpoint = "http://localhost:3000/sample/v01/event",
      appToken = null;

  var connector = (function() {
    var queue = [], sending = false;

    return {
      length: function () {
        return queue.length;
      },

      isEmpty: function() {
        return queue.length === 0;
      },

      isSending: function() {
        return sending === true;
      },

      add: function(event, callback) {
        queue[queue.length] = {
          event: event,
          callback: callback,
        };
        this.sendNext();
      },

      sendNext: function() {
        if (sending || this.isEmpty()) {
          return ;
        }

        sending = true;
        var data = queue[0];
        var string = JSON.stringify({ p: data.event });
        var self = this;

        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function() {
          queue.shift();

          sending = false;
          self.sendNext();
        }, true);

        xhr.addEventListener("error", function() {

          sending = false;
          self.sendNext();
        });

        xhr.open("POST", sample.getEndpoint());
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.setRequestHeader('Content-length', string.length);
        xhr.setRequestHeader('Connection', 'close');

        xhr.send(string);
      },
    };

  })();

var sample = {
    setEndpoint: function(newEndpoint) {
      endpoint = newEndpoint;
    },

    getEndpoint: function() {
      return endpoint;
    },

    setAppToken: function(newAppToken) {
      appToken = newAppToken;
    },

    track: function(eventName, params) {
      params.event_name = eventName;
      params.app_token = appToken;

      connector.add(params, function() { });
    }
};	

window.sample = sample;



})(window);