//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

var Bb       = require('backbone');
var Mn       = require('backbone.marionette');
var template = require('./view.pug');

//-----------------------------------------------------------------------------
// View
//-----------------------------------------------------------------------------

var View = Mn.View.extend({
  template: _.template(template),
});

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export {View}

//-----------------------------------------------------------------------------
