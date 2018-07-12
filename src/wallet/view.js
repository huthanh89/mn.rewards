//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

var _        = require('lodash');
var async    = require('async');
var Bb       = require('backbone');
var Mn       = require('backbone.marionette');
var template = require('./view.pug');

require('backbone.stickit');

//-----------------------------------------------------------------------------

var ArktMN1 = 'AVdhjMoc5ZF3yLXr2CEt6us3qNyDvyozkt'
var ArktMN2 = 'ANKFHxoBYSQqydrJn5GDWFBmEke3y6AD57'
var XgsMN1  = 'GJswzuGtocis5kNUsBkfTcqjaWQhy4h3UU'
var GinMN1  = 'GgDG1Ne3Ze5AJDBrB1GguADLS4tTcWjc6N'

//-----------------------------------------------------------------------------
// Model
//-----------------------------------------------------------------------------

var WalletModel = Backbone.Model.extend({
  idAttribute: '_id',
  urlRoot :    '/api/arktur/wallet',
  initialize: function(attributes, options){
    this.urlRoot= '/api/' + options.type + '/wallet'
  }
});

var CryptoBridgeModel = Backbone.Model.extend({
  idAttribute: 'id'
});

var CryptoBridgeCollection = Backbone.Collection.extend({
  model: CryptoBridgeModel,
  url:  '/api/cryptobridge'
});

var CoinMarketCapModel = Backbone.Model.extend({
  idAttribute: '_id',
  urlRoot:     '/api/coinmarketcap'
});

//-----------------------------------------------------------------------------
// View
//-----------------------------------------------------------------------------

var View = Mn.View.extend({

  template: _.template(template),

  bindings: {
    '#wallet-name': 'name',
    '#wallet-address': 'address',
    '#wallet-price': {
      observe: 'price',
      onGet: function(value){
        return _.round(value, 2);
      }
    },
    '#wallet-received': 'received',
    '#wallet-received-usd': {
      observe: 'price',
      onGet: function(value){
        var result = this.model.get('received') * value;
        return _.round(result, 2);
      }
    },
    '#wallet-sent': 'sent',
    '#wallet-sent-usd': {
      observe: 'price',
      onGet: function(value){
        var result = this.model.get('sent') * value;
        return _.round(result, 2);
      }
    },
    '#wallet-excess': {
      observe: 'balance',
      onGet: function(value){
        var result = this.model.get('balance') - 10000;
        return result;
      }
    },
    '#wallet-excess-usd': {
      observe: 'price',
      onGet: function(value){
        var excess = this.model.get('balance') - 10000;
        var result = value * excess;
        return _.round(result, 2);
      }
    },
    '#wallet-balance': 'balance',
    '#wallet-balance-usd': {
      observe: 'price',
      onGet: function(value){
        var result = this.model.get('balance') * value;
        return _.round(result, 2);
      }
    }
  },

  initialize: function(){
    this.model = new WalletModel({
      name:   'ARKT-MN1',
      type:   'arktur',
      symbol: 'ART',
      address: ArktMN1
    },
    {type: 'arktur'}
    );

    // Fire operations synchronously to assurely
    // that all the data arrives for the next function to use.

    var view = this;

    async.series([
      function(callback) {
        view.fetchWallet(callback);
      },
      function(callback) {
        view.fetchPrices(callback);
      },
      function(callback) {
        view.fetchUSD(callback);
      }
    ],
    // optional callback
    function(err, results) {
        // TODO: Add error handlers.
        // results is now equal to ['one', 'two']
    });
  
  },
  
  // Fetch wallet data.

  fetchWallet: function(callback){
    this.model.fetch({
      data: {
        address: this.model.get('address')
      },
      success: function(){
        callback();
      }
    });
  },

  // Fetch asking prices from Cryptobridge.

  fetchPrices: function(callback){

    var model = this.model;

    new CryptoBridgeCollection().fetch({
      success: function(cbCollection){
        var symbol = model.get('symbol');
        var cbModel = cbCollection.get(symbol + '_BTC');
        model.set(_.pick(cbModel.attributes, ['ask', 'bid', 'last']));
        callback();
      }
    });
  },

  // Fetch info on Bitcoin.

  fetchUSD: function(callback){

    var model = this.model;

    new CoinMarketCapModel().fetch({
      success: function(cmcModel){
        var btcUSDPrice = cmcModel.get('data').quotes.USD.price;
        var price = model.get('last') * btcUSDPrice;
        model.set('price', price);
        callback();
      }
    });
  },

  onAttach: function(){
    this.stickit();
  }

});

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export {Model, View}

//-----------------------------------------------------------------------------
