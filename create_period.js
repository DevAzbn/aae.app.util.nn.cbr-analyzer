'use strict';

var azbn = new require(__dirname + '/../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var today = new Date();

var argv = require('optimist')
	//.usage('Usage: $0 --project=[Name of project]')
	.default('start_at', '01/01/1998')
	.default('stop_at', '31/12/' + today.getFullYear())
	.demand(['start_at', 'stop_at'])
	.argv
;

var daysInMonth = function(y, m) {
	return 32 - new Date(y, m, 32).getDate();
};

app.clearRequireCache(require);

var start_at_arr = argv.start_at.split('/');
var stop_at_arr = argv.stop_at.split('/');

var dates = {};

for(var y = parseInt(start_at_arr[2]); y < (parseInt(stop_at_arr[2]) + 1); y++) {
	
	if(dates[y]) {
		
	} else {
		dates[y] = {};
	}
	
	for(var m = 0; m < 12; m++) {
		
		var _m = '' + (m + 1);
		
		if(_m.length < 2) {
			_m = '0' + _m;
		}
		
		dates[y][_m] = {};
		
		var _dm = daysInMonth(y, m);
		
		for(var d = 1; d < (_dm + 1); d++) {
			
			var _d = '' + d;
			
			if(_d.length < 2) {
				_d = '0' + _d;
			}
			
			dates[y][_m][_d] = {};
			
			app.mkDataDir('dates/' + y + '/' + _m + '/' + _d);
			
			app.saveFile('dates/' + y + '/' + _m + '/' + _d + '/.gitkeep', '');
			
		}
		
	}
	
}

console.dir(dates);
