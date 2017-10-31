'use strict';

//https://developers.google.com/chart/interactive/docs/gallery/linechart

var azbn = new require(__dirname + '/../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var today = new Date();

var argv = require('optimist')
	//.usage('Usage: $0 --project=[Name of project]')
	.default('cur', 'USD')
	.default('days', 30)
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

for(var i = 0; i < (data_size - argv.days - 1); i++) {
	
	var part = values_r.slice(i + 1, i + 1 + argv.days);
	
	part.forEach(function(item, j, arr){
		part[j] = item * 0.001;
	});
	
	var _output = values_r[i] * 0.001;
	
	train_data.push({
		input : part,
		output : [_output],
	});
	
	console.log('Added', ':', _output);
	
}

console.log('Train data was created');

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

//app.saveJSON('nn/train/' + argv.nn, train_data);

nn.train(train_data, {
	errorThresh : 0.00000225,	// error threshold to reach 0.005
	iterations : 20000,		// maximum training iterations
	log : true,				// console.log() progress periodically
	logPeriod : 1,		// number of iterations between logging
	learningRate : 0.05		// learning rate
});

app.saveJSON('nn/currencies/' + argv.nn, nn.toJSON());