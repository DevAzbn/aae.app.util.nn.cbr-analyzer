'use strict';

//https://developers.google.com/chart/interactive/docs/gallery/linechart

var azbn = new require(__dirname + '/../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var today = new Date();

var argv = require('optimist')
	//.usage('Usage: $0 --project=[Name of project]')
	.default('cur', 'USD')
	.default('days', 90)
	.default('nn', 'default')
	.default('type', 'default')
	.demand(['cur','days'])
	.argv
;

app.clearRequireCache(require);

var train_data = [];

var linear = app.loadJSON('currencies/' + argv.cur + '_linear');

var values = Object.keys(linear).map(function(key) {
	return linear[key];
});

var values_r = values.reverse();

var data_size = values_r.length;

var i = azbn.randint(0, data_size - argv.days - 1);

var i_value = values_r[i] * 0.001;

console.log('Need value', i_value);

var part = values_r.slice(i + 1, i + 1 + argv.days);

part.forEach(function(item, j, arr){
	part[j] = item * 0.001;
});

var config_data = app.loadJSON('nn/config/' + argv.nn);

//https://www.npmjs.com/package/brain.js
var brain = require('brain.js');

var nn = null;

switch(argv.type) {
	
	case 'rnn' : {
		nn = new brain.recurrent.RNN();
	}
	break;
	
	default : {
		nn = new brain.NeuralNetwork(config_data);
	}
	break;
	
}

nn.fromJSON(app.loadJSON('nn/currencies/' + argv.nn));


//app.saveJSON('nn/train/' + argv.nn, train_data);

var _output = nn.run(part);

console.log('Result', _output);

console.log('Delta', _output - i_value);