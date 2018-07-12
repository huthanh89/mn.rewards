//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

var acct     = require('accounting');
var numeral  = require('numeral');
var moment   = require('moment');
var Bb       = require('backbone');
var Mn       = require('backbone.marionette');
var template = require('./view.pug');

require('backbone.stickit');

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

var TransactionCollection = Bb.Collection.extend({
  comparator: function(model){
    return model.get('time');
  }
});

//-----------------------------------------------------------------------------
// View
//-----------------------------------------------------------------------------

var View = Mn.View.extend({

  template: _.template(template),

  tagName: 'tr',

  bindings: {
    '.portfolio-item-name': 'name',
    '.portfolio-item-rewarded': {
      observe: 'balance',
      onGet: function(){
        var amt      = this.model.get('amt');
        var received = this.model.get('received');
        var rewarded = received - amt;
        var result = rewarded * this.model.get('price')
        return acct.formatNumber(rewarded) + ' | ' + numeral(result).format('$0,000');
      }
    },
    '.portfolio-item-roi': {
      observe: 'invested',
      onGet: function(invested){
        var mnValue = this.model.get('received') * this.model.get('price')
        var result  = mnValue - invested;
        var el      = this.$el.find('.portfolio-item-roi');
        if(result < 0){
          el.addClass('table-danger');
        }
        else{
          el.addClass('table-success');
        }
        return numeral(result).format('$0,000');
      }
    },
    '.portfolio-item-invested': {
      observe: 'invested',
      onGet: function(value){
        return numeral(value).format('$0,000');
      }
    },
    '.portfolio-item-daily': {
      observe: 'estimateDaily',
      onGet: function(value){
        return  numeral(value).format('$0,000.00');
      }
    },
    '.portfolio-item-frequency': 'frequency',
    '.portfolio-item-next': {
      observe: 'next',
      onGet: function(value){
        return value;
      }
    },
    '.portfolio-item-balance': {
      observe: 'balance',
      onGet: function(value){
        return acct.formatNumber(value);
      }
    },
    '.portfolio-item-balance-usd': {
      observe: 'price',
      onGet: function(value){
        var result = this.model.get('balance') * value;
        return numeral(result).format('$0,000');
      }
    },
    '.portfolio-item-excess': {
      observe: 'balance',
      onGet: function(value){
        var result = this.model.get('balance') - this.model.get('amt');
        return acct.formatNumber(result);
      }
    },
    '.portfolio-item-excess-usd': {
      observe: 'price',
      onGet: function(value){
        var excess = this.model.get('balance') - this.model.get('amt');
        var result = value * excess;
        return numeral(result).format('$0,000');
      }
    }
  },
  
  modelEvents: {
    'transaction:fetched': function(transaction){
      this.collection.add(transaction);
      this.actualDate('actualLast4Days', moment().subtract(4,'days'));
      this.estimate('estimateDaily', 0.25);

      // Parse for reward frequency in Hours.

      if(this.collection.length > 1){
        var startTime = this.collection.at(this.collection.length-2).get('time');
        var endTime   = this.collection.at(this.collection.length-1).get('time');
        var start     = moment.unix(startTime);
        var end       = moment.unix(endTime);

        // Get frequency of rewards.

        var freq = end.diff(start, 'hours', true);
        this.model.set('frequency', moment.duration(freq, "hours").humanize());

        // Find when is next reward.

        var next = end.add(freq,'hours');



//        var next = end.add(freq, 'hours');
        this.model.set('next', next.fromNow());
      }

    }
  },

  initialize: function(){
    this.collection = new TransactionCollection();
  },

  estimate: function(attribute, days){
    this.model.set(attribute, this.model.get('actualLast4Days') * days);
  },

  actualDate: function(attribute, date){

    var models = _.omitBy(this.collection.models, function(model){
      var time = model.get('time');
      return moment.unix(time).isBefore(date);
    });

    var values = _.map(models, function(model){
      return model.get('usd');
    });
    var total = _.sum(values);
    this.model.set(attribute, total);
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
