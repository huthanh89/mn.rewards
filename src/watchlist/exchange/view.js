//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

var $        = require('jquery');
var _        = require('lodash');
var acct     = require('accounting');
var numeral  = require('numeral');
var moment   = require('moment');
var Bb       = require('backbone');
var Mn       = require('backbone.marionette');
var Radio    = require('backbone.radio');
var template = require('./view.pug');

require('backbone.stickit');

//-----------------------------------------------------------------------------
// View
//-----------------------------------------------------------------------------

var View = Mn.View.extend({

  template: _.template(template),

  tagName: 'tbody',

  bindings: {
    '#exchange-price-arkt': {
      observe: 'estimateDaily',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#exchange-estimate-weekly': {
      observe: 'estimateWeekly',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    }
  },

  initialize: function(){
    this.model = new Bb.Model();
    var view   = this;
    Radio.channel('exchange').reply({
      'update:exchange': function(topView){
        var data         = topView.cmcModel.get('data')
        var btcUSD       = data.quotes.USD.price;
        var btcMarketCap = data.quotes.USD.market_cap;
        $('#exchange-usd-btc').text((numeral(btcUSD).format('$0,000')));
        $('#exchange-marketcap-btc').text(numeral(btcMarketCap).format('$0.0a'));
        view.updateModel(topView, 'ART', btcUSD, 5418306);
        view.updateModel(topView, 'XGS', btcUSD, 1645496);
        view.updateModel(topView, 'GIN', btcUSD, 2177258);
        view.updateModel(topView, 'XMN', btcUSD, 1019249);
      }
    });
  },
  
  updateModel: function(topView, symbol, btcUSD, supply){
    var cbModel   = topView.CryptoBridgeCollection.get(symbol + '_BTC');
    var lastPrice = cbModel.get('last');
    var priceUSD  = lastPrice * btcUSD;
    var marketcap = priceUSD * supply;
    
    var mnAmt = {
      'ART': 10000,
      'GIN': 1000,
      'XGS': 5000,
      'XMN': 1000
    };

    var mnCost = mnAmt[symbol] * priceUSD;

    $('#exchange-usd-' + symbol.toLowerCase()).text(acct.formatMoney(priceUSD));
    $('#exchange-btc-' + symbol.toLowerCase()).text(lastPrice);
    $('#exchange-marketcap-' + symbol.toLowerCase()).text(numeral(marketcap).format('$0.0a'));
    $('#exchange-cost-' + symbol.toLowerCase()).text(numeral(mnCost).format('$0,000'));

    // Parse for time of next reward reduction.

    var coin = topView.exchangeCollection.where({
      symbol: symbol
    })[0];

    var time = (coin.get('nextReduction') - coin.get('blockCount')) * coin.get('blockTime');
    var reduce = moment.duration(time, 'seconds').humanize(true);
    $('#exchange-reduce-' + symbol.toLowerCase()).text(reduce);



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
