'use strict';

//https://developers.google.com/chart/interactive/docs/gallery/linechart

var azbn = new require(__dirname + '/../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var today = new Date();

var argv = require('optimist')
	//.usage('Usage: $0 --project=[Name of project]')
	.default('cur', 'USD')
	.demand(['cur'])
	.argv
;

var curs = argv.cur.split(',');

app.clearRequireCache(require);

var data = {};
var data_size = 0;
var bigdata = {};

for(var k in curs) {
	
	var uid = data[curs[k]];
	
	data[uid] = app.loadJSON('currencies/' + uid + '_linear');
	data_size++;
	
	for(var d in data[uid]) {
		
		bigdata[parseInt(d)] = [];
		
	}
	
}

for(var d in bigdata) {
	
	for(var _cur in data) {
		
		if(data[_cur][d]) {
			
			bigdata[d].push(data[_cur][d]);
			
		}
		
	}
	
}

var result = [];

for(var d in bigdata) {
	
	if(bigdata[d].length == data_size) {
		result.push([d].concat(bigdata[d]));
	}
	
}

app.saveJSON('currencies/' + argv.cur + '_array', result);

console.dir(result.length);
