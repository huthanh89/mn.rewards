//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

var _        = require('lodash');
var Bb       = require('backbone');
var Mn       = require('backbone.marionette');
var Radio    = require('backbone.radio');
var template = require('./root.pug');

require('jquery');
require('bootstrap');

import {Router}           from './router'
import {View as NavView}  from './nav/view'

//-----------------------------------------------------------------------------
// Root View
//-----------------------------------------------------------------------------

var RootView = Mn.View.extend({

  template: _.template(template),

  regions: {
    nav:    '#nav',
    main:   '#main',
    footer: '#footer'
  },

  onAttach: function(){
    this.getRegion('nav').show(new NavView());

    var region = this.getRegion('main');
    Radio.channel('main').reply('main:region', function() {
        return region;
    });
  }

});

//-----------------------------------------------------------------------------
// Application
//-----------------------------------------------------------------------------

var App = Mn.Application.extend({

  region: '#root-content',

  onBeforeStart: function() {
    var router = new Router();
  },

  onStart: function() {
    this.showView(new RootView());
    Bb.history.start({
      pushState : true
    });
  }
});

var app = new App();
app.start();

//-----------------------------------------------------------------------------
