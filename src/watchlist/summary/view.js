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

  bindings: {
    '#summary-estimate-wage': {
      observe: 'estimateWage',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-estimate-hourly': {
      observe: 'estimateHourly',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-estimate-daily': {
      observe: 'estimateDaily',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-estimate-weekly': {
      observe: 'estimateWeekly',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-estimate-monthly': {
      observe: 'estimateMonthly',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-estimate-yearly': {
      observe: 'estimateYearly',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-actual-today': {
      observe: 'actualToday',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-actual-last24hours': {
      observe: 'actualLast24Hours',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-actual-last7days': {
      observe: 'actualLast7Days',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-actual-last30days': {
      observe: 'actualLast30Days',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-roi-invested': {
      observe: 'roiInvested',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-roi-rewarded': {
      observe: 'roiRewarded',
      onGet: function(value){
        return acct.formatMoney(value);
      }
    },
    '#summary-roi-result': {
      observe: 'roiResult',
      onGet: function(value){
        var el = this.$el.find('#summary-roi-result');
        if(value < 0){
          el.addClass('table-danger');
        }
        else{
          el.addClass('table-success');
        }
        return numeral(value).format('$0,000.00');
      }
    }
  },

  initialize: function(){

    this.model      = new Bb.Model();
    this.collection = new Bb.Collection();
    var view        = this;

    Radio.channel('summary').reply({
      'update:summary': function(model){
        view.collection.add(model);
        view.actualDate('actualToday', moment().startOf('day'));
        view.actualDate('actualLast24Hours', moment().subtract(1,'days'));
        view.actualDate('actualLast7Days', moment().subtract(7,'days'));
        view.actualDate('actualLast30Days', moment().subtract(1,'months'));

        view.estimate('estimateWage',    0.025);
        view.estimate('estimateHourly',  0.005952375);
        view.estimate('estimateDaily',   0.142857);
        view.estimate('estimateWeekly',  1);
        view.estimate('estimateMonthly', 4.34524);
        view.estimate('estimateYearly',  52.1429);

        view.roiRewarded();
        view.roiResult();
      },
      
      'roi:invested': function(topView){
        var total = 0;
        topView.collection.each(function(model){
          var amt = model.get('invested');
          total = total + amt;
        });
        view.model.set('roiInvested', total);
      },

      'total:balance': function(topView){
        var total = 0;
        topView.collection.each(function(model){
          total = total + (model.get('balance') * model.get('price'));
        });
        $('#summary-portfolio-balance').text(acct.formatMoney(total));
        view.model.set('portfolioBalance', total);
      },

      'total:excess': function(topView){
        var total = 0;
        topView.collection.each(function(model){
          var amt = model.get('balance') - model.get('amt');
          total = total + (amt * model.get('price'));
        });
        $('#summary-portfolio-excess').text(acct.formatMoney(total));
        view.model.set('portfolioExcess', total);
      }
    });


  },
  
  estimate: function(attribute, days){
    this.model.set(attribute, this.model.get('actualLast7Days') * days);
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
  
  roiRewarded: function(){
    var total = _.sum(this.collection.pluck('usd'));
    this.model.set('roiRewarded', total);
  },

  roiResult: function(){
    var result = (this.model.get('portfolioBalance') - this.model.get('portfolioExcess') + this.model.get('roiRewarded')) - this.model.get('roiInvested') ;
    this.model.set('roiResult', result);
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
