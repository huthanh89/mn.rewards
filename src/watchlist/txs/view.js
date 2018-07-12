//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

var _     = require('lodash');
var async = require('async');
var Bb    = require('backbone');
var Mn    = require('backbone.marionette');
var Radio = require('backbone.radio');

import {View as ChildView} from './item/view';

//-----------------------------------------------------------------------------
// Models
//-----------------------------------------------------------------------------

var ViewModel = Bb.Model.extend({
  idAttribute: 'id'
});

var ViewCollection = Bb.Collection.extend({
  model: ViewModel,
  comparator: function(model){
    return -model.get('time');
  }
});

var TransactionModel = Bb.Model.extend({
  idAttribute: '_id',
  initialize: function(attributes, options){
    this.urlRoot= '/api/' + options.type + '/transaction'
  }
});

//-----------------------------------------------------------------------------
// CollectionView
//-----------------------------------------------------------------------------

var View = Mn.CollectionView.extend({

  childView: ChildView,

  tagName: 'tbody',

  initialize: function(){

    this.collection = new ViewCollection();
    var view        = this;

    this.options.walletCollection.transactions = this.collection;
    this.options.walletCollection.each(function(model){
      view.addTransactions(model);
    });

    //view.addTransactions(this.options.walletCollection.models[2]);
    //view.addTransactions(this.options.walletCollection.models[2]);

  },

  addTransactions: function(walletModel){

    var collection = this.collection;

    _.each(walletModel.get('last_txs'), function(tx){

      var transactionModel = new TransactionModel({
        txid: tx.addresses

      }, {type: walletModel.get('type')});

      transactionModel.fetch({
        data: {
          txid: transactionModel.get('txid')
        },
        success: function(txModel){

          // Parse for value in transaction.

          var value = 'N/A';

          var walletAddress = walletModel.get('address');


          _.each(txModel.get('vout'), function(obj){

            if(obj.scriptPubKey.type=='pubkeyhash' && obj.scriptPubKey.addresses[0]==walletAddress){
              value = obj.value;
            }
          });

          // Create model and add it the view's collection.

          if(value!='N/A' && value!=walletModel.get('amt') && txModel.get('confirmations') != 0){

            var usd = value * walletModel.get('price')

            var viewModel = new ViewModel({
              name:  walletModel.get('name'),
              time:  txModel.get('time'),
              txid:  txModel.get('txid'),
              value: value,
              usd:   usd
            });

            collection.add(viewModel);

            walletModel.trigger('transaction:fetched', viewModel);

            Radio.channel('summary').request('update:summary', viewModel);

          }

        }
      });
    });

  }

});

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export {View}

//-----------------------------------------------------------------------------
