//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

var $        = require('jquery');
var _        = require('lodash');
var moment   = require('moment');
var async    = require('async');
var acct     = require('accounting');
var Bb       = require('backbone');
var Mn       = require('backbone.marionette');
var Radio    = require('backbone.radio');
var template = require('./view.pug');

import {View as SummaryView}     from './summary/view';
import {View as ExchangeView}    from './exchange/view';
import {View as PortfolioView}   from './portfolio/view';
import {View as TransactionView} from './txs/view';

//-----------------------------------------------------------------------------

var ArktMN1 = 'AVdhjMoc5ZF3yLXr2CEt6us3qNyDvyozkt'
var ArktMN2 = 'ANKFHxoBYSQqydrJn5GDWFBmEke3y6AD57'
var ArktMN3 = 'AGzZsuTUKvc38292V2mR7qrptH8HYg4ozZ'
var ArktMN4 = 'AXQVnGYYFiYtuPtrxgbNSAG2wXtqkE5ZjK'
var ArktMN5 = 'AG4TcAcgp2CVdx5YfAJr55w2sspcLa3kwk'
var XgsMN1  = 'GJswzuGtocis5kNUsBkfTcqjaWQhy4h3UU'
var GinMN1  = 'GgDG1Ne3Ze5AJDBrB1GguADLS4tTcWjc6N'
var XmnMN1  = 'MDoq8rFiGyk1dsnkSpQVLh8zcoxqNRajKD'

//-----------------------------------------------------------------------------
// Models
//-----------------------------------------------------------------------------

var WalletModel = Backbone.Model.extend({
  idAttribute: '_id',
  initialize: function(attributes, options){
    this.urlRoot= '/api/' + options.type + '/wallet'
  }
});

var BlockModel = Backbone.Model.extend({
  idAttribute: '_id',
  initialize: function(attributes, options){
    this.urlRoot= '/api/' + options.type + '/blockcount'
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

  regions: {
    summary: {
      el: '#watchlist-summary',
      replaceElement: true
    },
    exchange: {
      el: '#watchlist-exchange-body',
      replaceElement: true
    },
    portfolio: {
      el: '#watchlist-portfolio-body',
      replaceElement: true
    },
    transaction: {
      el: '#watchlist-transaction-body',
      replaceElement: true
    }
  },

  onBeforeAttach: function(){

    this.collection = new Bb.Collection();

    this.addWallet({
      name:    'Arkt-Mn1',
      type:    'arktur',
      symbol:  'ART',
      amt:      10000,
      invested: 2900,
      address:  ArktMN1
    });
    this.addWallet({
      name:    'Arkt-Mn2',
      type:    'arktur',
      symbol:  'ART',
      amt:      10000,
      invested: 2100,
      address:  ArktMN2
    });
    this.addWallet({
      name:    'Arkt-Mn3',
      type:    'arktur',
      symbol:  'ART',
      amt:      10000,
      invested: 1100,
      address:  ArktMN3
    });
    this.addWallet({
      name:    'Arkt-Mn4',
      type:    'arktur',
      symbol:  'ART',
      amt:      10000,
      invested: 650,
      address:  ArktMN4
    });
    this.addWallet({
      name:    'Arkt-Mn5',
      type:    'arktur',
      symbol:  'ART',
      amt:      10000,
      invested: 300,
      address:  ArktMN5
    });
    this.addWallet({
      name:    'Xgs-Mn1',
      type:    'genesisx',
      symbol:  'XGS',
      amt:      5000,
      invested: 4900,
      address:  XgsMN1
    });
    this.addWallet({
      name:    'Gin-Mn1',
      type:    'gincoin',
      symbol:  'GIN',
      amt:      1000,
      invested: 12500,
      address:  GinMN1
    });
    /*
    this.addWallet({
      name:    'Motion-MN1',
      type:    'motion',
      symbol:  'XMN',
      amt:      1000,
      invested: 1700,
      address:  XmnMN1
    });
*/
    // Fire operations synchronously to assurely
    // that all the data arrives for the next function to use.

    var view = this;

    async.series([
      function(callback) {
        view.fetchWallet(callback);
      },
      function(callback) {
        view.fetchBlock(callback);
      },
      function(callback) {
        view.fetchCryptoBridge(callback);
      },
      function(callback) {
        view.fetchCoinMarketCap(callback);
      }
    ],

    function(err, results) {

      // TODO: Add error handlers.

      view.showViews();
      
      Radio.channel('summary').request('roi:invested', view);

      Radio.channel('summary').request('total:balance', view);
      Radio.channel('summary').request('total:excess', view);

      Radio.channel('exchange').request('update:exchange', view);

    });
  
  },

  // Add wallets to collection.

  addWallet: function(options){
    var model = new WalletModel(options, {type: options.type});
    this.collection.add(model);

  },

  // Fetch data of each wallet.

  fetchWallet: function(callback){

    var counter = 0;

    var collection = this.collection.each(function(model){
      model.fetch({
        data: {
          address: model.get('address')
        },
        success: function(){
          counter++;
          if(counter == collection.length){
            callback();
          }
        }
      });
    });
  },

  // Fetch current coin's block count.

  fetchBlock: function(callback){
    var counter = 0;
    var coins = [
      {type: 'arktur',   symbol: 'ART', nextReduction: 100000,  blockTime: 59 },
      {type: 'genesisx', symbol: 'XGS', nextReduction: 100000, blockTime: 60 },
      {type: 'gincoin',  symbol: 'GIN', nextReduction: 230000, blockTime: 123},
      {type: 'motion',   symbol: 'XMN', nextReduction: 526100, blockTime: 119}
    ];

    this.exchangeCollection = new Bb.Collection();
    var view = this;

    _.each(coins, function(coin){
      new BlockModel({},{type:coin.type}).fetch({
        success: function(model, blockCount){
          view.exchangeCollection.add(
            _.extend({blockCount: blockCount}, coin)
          );
          counter++;
          if(counter == coins.length){
            callback();
          }
        }
      });
    });


  },

  // Fetch asking prices from Cryptobridge.

  fetchCryptoBridge: function(callback){
    var collection = this.collection;
    var view       = this;
    new CryptoBridgeCollection().fetch({
      success: function(cbCollection){
        view.CryptoBridgeCollection = cbCollection;
        collection.each(function(model){
          var symbol = model.get('symbol');
          var cbModel = cbCollection.get(symbol + '_BTC');
          model.set(_.pick(cbModel.attributes, ['ask', 'bid', 'last']));
        });
        callback();
      }
    });
  },

  // Fetch info on Bitcoin.

  fetchCoinMarketCap: function(callback){
    var collection = this.collection;
    var view       = this;
    new CoinMarketCapModel().fetch({
      success: function(cmcModel){
        view.cmcModel = cmcModel;
        var btcUSDPrice = cmcModel.get('data').quotes.USD.price;
        collection.each(function(model){
          var price = model.get('last') * btcUSDPrice;
          model.set('price', price);
        });
        callback();
      }
    });
  },

  showViews: function(){
    
    this.getRegion('summary').show(new SummaryView({
      collection: this.collection
    }));

    this.getRegion('exchange').show(new ExchangeView({
      collection: this.collection
    }));

    this.getRegion('portfolio').show(new PortfolioView({
      collection: this.collection
    }));

    this.getRegion('transaction').show(new TransactionView({
      walletCollection: this.collection
    }));

  },

  // Refresh Page every 10 minutes

  onAttach: function(){

    function timer(seconds, cb) {
      var remaningTime = seconds;
      window.setTimeout(function() {
        cb(remaningTime);
        if (remaningTime > 0) {
          timer(remaningTime - 1, cb); 
        }
      }, 1000);
    }

    var callback = function(remaningTime) {

      var left = moment.duration({
        seconds: remaningTime,
      }).humanize(true);

      $('#watchlist-timer').text(left);
    };

    timer(600, callback);

    setInterval(function(){ 
      location.reload();
    }, 600000);
  }

});

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export {View}

//-----------------------------------------------------------------------------
