//---------------------------------------------------------------------------------------------
// Import
//---------------------------------------------------------------------------------------------

var express = require('express');
var Client  = require('node-rest-client').Client;
var path    = require("path");

// Initialize variables.

var app    = express();
var client = new Client();

// Configure static files to be useable.
// i.e - fix Mime Type.

app.use(express.static(__dirname + '/static' ));

// Define view location.

app.set('views', path.join(__dirname, '/static'));
app.set('view engine', 'pug');

//---------------------------------------------------------------------------------------------
// Front end routes
//---------------------------------------------------------------------------------------------

app.get('/', function (req, res) {
    res.render('index');
})

app.get('/home', function (req, res) {
    res.render('index');
})

app.get('/portfolio', function (req, res) {
    res.render('index');
})

app.get('/wallet', function (req, res) {
    res.render('index');
})


//---------------------------------------------------------------------------------------------
// API Calls
//---------------------------------------------------------------------------------------------

// Get Arktur wallet data.

app.get('/api/arktur/wallet', function (req, res) {

    url = "http://explorer.arktur.cc/ext/getaddress/";

    client.registerMethod("jsonMethod", url + req.query.address, "GET");
    client.methods.jsonMethod(function (data, response) {
        res.json(data);
    });

})

// Get Arktur transaction data.

app.get('/api/arktur/transaction', function (req, res) {

    url = "http://explorer.arktur.cc/api/getrawtransaction?txid=" + req.query.txid + "&decrypt=1";

    client.registerMethod("jsonMethod", url , "GET");
    client.methods.jsonMethod(function (data, response) {
        res.json(data);
    });

})

// Get Arktur block count.

app.get('/api/arktur/blockcount', function (req, res) {

    url = "http://explorer.arktur.cc/api/getblockcount";

    client.registerMethod("jsonMethod", url , "GET");
    client.methods.jsonMethod(function (data, response) {
        res.send(data.toString());
    });

})

// Get GenesisX wallet data.

app.get('/api/genesisx/wallet', function (req, res) {

    url = "http://explorer.genesisx.net/ext/getaddress/";

    client.registerMethod("jsonMethod", url + req.query.address, "GET");
    client.methods.jsonMethod(function (data, response) {
        res.json(data);
    });

})

// Get GenesisX transaction data.

app.get('/api/genesisx/transaction', function (req, res) {

    url = "http://explorer.genesisx.net/api/getrawtransaction?txid=" + req.query.txid + "&decrypt=1";

    client.registerMethod("jsonMethod", url , "GET");
    client.methods.jsonMethod(function (data, response) {
        res.json(data);
    });

})


// Get  GenesisX block count.

app.get('/api/genesisx/blockcount', function (req, res) {

    url = "http://explorer.genesisx.net/api/getblockcount";

    client.registerMethod("jsonMethod", url , "GET");
    client.methods.jsonMethod(function (data, response) {
        res.send(data.toString());
    });

})


// Get GinCoin wallet data.

app.get('/api/gincoin/wallet', function (req, res) {

    url = "http://explorer.gincoin.io/ext/getaddress/";

    client.registerMethod("jsonMethod", url + req.query.address, "GET");
    client.methods.jsonMethod(function (data, response) {
        res.json(data);
    });

})

// Get Gincoin transaction data.

app.get('/api/gincoin/transaction', function (req, res) {

    url = "http://explorer.gincoin.io/api/getrawtransaction?txid=" + req.query.txid + "&decrypt=1";

    client.registerMethod("jsonMethod", url , "GET");
    client.methods.jsonMethod(function (data, response) {
        res.json(data);
    });

})

// Get Gincoin block count.

app.get('/api/gincoin/blockcount', function (req, res) {

    url = "http://explorer.gincoin.io/api/getblockcount";

    client.registerMethod("jsonMethod", url , "GET");
    client.methods.jsonMethod(function (data, response) {
        res.send(data.toString());
    });

})

// Get Motion wallet data.

app.get('/api/motion/wallet', function (req, res) {

    url = "https://explorer.motionproject.org/ext/getaddress/";

    client.registerMethod("jsonMethod", url + req.query.address, "GET");
    client.methods.jsonMethod(function (data, response) {
        res.json(data);
    });

})

// Get Motion transaction data.

app.get('/api/motion/transaction', function (req, res) {

    url = "https://explorer.motionproject.org/api/getrawtransaction?txid=" + req.query.txid + "&decrypt=1";

    client.registerMethod("jsonMethod", url , "GET");
    client.methods.jsonMethod(function (data, response) {
        res.json(data);
    });

})

// Get Motion block count.

app.get('/api/motion/blockcount', function (req, res) {

    url = "https://explorer.motionproject.org/api/getblockcount";

    client.registerMethod("jsonMethod", url , "GET");
    client.methods.jsonMethod(function (data, response) {
        res.send(data.toString());
    });

})


// Get CryptoBridge data.

app.get('/api/cryptobridge', function (req, res) {
    client.registerMethod("jsonMethod", "https://api.crypto-bridge.org/api/v1/ticker", "GET");
    client.methods.jsonMethod(function (data, response) {
        res.json(data);
    });

})

// Get CoinMarketCap data.

app.get('/api/coinmarketcap', function (req, res) {
    client.registerMethod("jsonMethod", "https://api.coinmarketcap.com/v2/ticker/1/", "GET");
    client.methods.jsonMethod(function (data, response) {
        res.json(data);
    });

})

// Start server on port 8081.

var server = app.listen(8081, '0.0.0.0', function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Website now running on http://localhost", host, port)
})