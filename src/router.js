//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

var Mn    = require('backbone.marionette');
var Radio = require('backbone.radio');

import {View as PortfolioView} from './watchlist/view'
import {View as WalletView}    from './wallet/view'

//-----------------------------------------------------------------------------
// Controller
//-----------------------------------------------------------------------------

var Controller = {

  home: function() {
    console.log('home');
  },

  portfolio: function() {
    var region = Radio.channel('main').request('main:region');
    region.show(new PortfolioView());
  },

  wallet: function() {
    var region = Radio.channel('main').request('main:region');
    region.show(new WalletView());
  }

};

//-----------------------------------------------------------------------------
// Application Router
//-----------------------------------------------------------------------------

  var Router = Mn.AppRouter.extend({
    controller: Controller,
  
    appRoutes: {
      '':          'home',
      '/':         'home',
      '/home':     'home',
      'portfolio': 'portfolio',
      'wallet':    'wallet'
    }
  
  });

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export {Router}

//-----------------------------------------------------------------------------
