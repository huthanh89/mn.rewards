//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

var _        = require('lodash');
var acct     = require('accounting');
var moment   = require('moment');
var Bb       = require('backbone');
var Mn       = require('backbone.marionette');
var template = require('./view.pug');

require('backbone.stickit');

//-----------------------------------------------------------------------------
// View
//-----------------------------------------------------------------------------

var View = Mn.View.extend({

  template: _.template(template),

  tagName: 'tr',

  bindings: {
    '.transaction-item-name': 'name',
    '.transaction-item-time': {
      observe: 'time',
      onGet: function(value){
        return moment.unix(value).fromNow();
      }
    },
    '.transaction-item-txid': 'txid',
    '.transaction-item-value': {
      observe: 'value',
      onGet: function(value){
        return acct.formatNumber(value, 0);
      }
    },
    '.transaction-item-usd': {
      observe: 'usd',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    }
  },

  onAttach: function(){
    this.stickit();
  }

});

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export {View}

//-----------------------------------------------------------------------------
