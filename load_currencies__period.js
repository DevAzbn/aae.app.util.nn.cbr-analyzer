'use strict';

var azbn = new require(__dirname + '/../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var async = require('async');
var parseXML = require('xml2js').parseString;

var today = new Date();

var argv = require('optimist')
	//.usage('Usage: $0 --project=[Name of project]')
	.default('start_at', '01/01/1998')
	.default('stop_at', today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear())
	.demand(['start_at', 'stop_at'])
	.argv
;

var daysInMonth = function(y, m) {
	return 32 - new Date(y, m, 32).getDate();
};

app.clearRequireCache(require);

var dates = [];
var currencies_struct = {};
var currencies_linear = {};
var tasks = [];

var step = 86400 * 1000;

var start_at_arr = argv.start_at.split('/');
var stop_at_arr = argv.stop_at.split('/');

var start_at_utc = new Date(
	start_at_arr[2],
	parseInt(start_at_arr[1]) - 1,
	parseInt(start_at_arr[0]),
	0,
	1,
	0
).getTime();

var stop_at_utc = new Date(
	stop_at_arr[2],
	parseInt(stop_at_arr[1]) - 1,
	parseInt(stop_at_arr[0]),
	0,
	1,
	0
).getTime();

var pos = start_at_utc;

while(pos < (stop_at_utc + step)) {
	
	var moment_utc = new Date(pos);
	var moment_d = moment_utc.getDate();
	var moment_m = moment_utc.getMonth();
	var moment_y = moment_utc.getFullYear();
	
	var moment_d_str = '' + moment_d;
	if(moment_d_str.length < 2) {
		moment_d_str = '0' + moment_d_str;
	}
	
	var moment_m_str = '' + (moment_m + 1);
	if(moment_m_str.length < 2) {
		moment_m_str = '0' + moment_m_str;
	}
	
	var date_str = [moment_d_str, moment_m_str, moment_y].join('/');
	
	//console.log(date_str);
	
	//currencies
	
	dates.push(date_str);
	
	pos = pos + step;
	
}

dates.forEach(function(item, i, arr) {
	
	var item_arr = item.split('/');
	
	tasks.push(function(callback) {
		
		azbn.mdl('web/http').r('GET', 'http://www.cbr.ru/scripts/XML_daily.asp?date_req=' + item, {}, function(error, response, body){
			
			if(error) {
				
				app.log.error(error);
				
				callback(error, null);
				
			} else {
				
				app.saveFile('dates/' + item_arr[2] + '/' + item_arr[1] + '/' + item_arr[0] + '/currencies.xml', body);
				
				/*
				app.log.info(item);
				
				app.saveFile('dates/' + item_arr[2] + '/' + item_arr[1] + '/' + item_arr[0] + '/data.xml', body);
				
				callback(null, null);
				*/
				
				parseXML(body, function (_error, _result) {
					
					if(_error) {
						
						callback(_error, null);
						
					} else {
						
						app.saveJSON('dates/' + item_arr[2] + '/' + item_arr[1] + '/' + item_arr[0] + '/currencies', _result);
						
						/*
						_result.ValCurs.Valute[
						{
							"$": {
							  "ID": "R01010"
							},
							"NumCode": [
							  "036"
							],
							"CharCode": [
							  "AUD"
							],
							"Nominal": [
							  "1"
							],
							"Name": [
							  "������������� ������"
							],
							"Value": [
							  "3,9127"
							]
						},
						]
						*/
						
						for(var i = 0; i < _result.ValCurs.Valute.length; i++) {
							
							var crnc = _result.ValCurs.Valute[i];
							
							var value = parseFloat(crnc['Value'][0].replace(',', '.'));
							
							
							if(currencies_linear[crnc['CharCode'][0]]) {
								
							} else {
								
								currencies_linear[crnc['CharCode'][0]] = {};
								//currencies_linear[crnc['CharCode'][0]] = [];
								
							}
							
							
							currencies_linear[crnc['CharCode'][0]][ parseInt('' + item_arr[2] + '' + item_arr[1] + '' + item_arr[0] + '') ] = value;
							//currencies_linear[crnc['CharCode'][0]].push(value);
							
							
							if(currencies_struct[crnc['CharCode'][0]]) {
								
							} else {
								
								currencies_struct[crnc['CharCode'][0]] = {};
								
							}
							
							if(currencies_struct[crnc['CharCode'][0]][item_arr[2]]) {
								
							} else {
								
								currencies_struct[crnc['CharCode'][0]][item_arr[2]] = {};
								
							}
							
							if(currencies_struct[crnc['CharCode'][0]][item_arr[2]][item_arr[1]]) {
								
							} else {
								
								currencies_struct[crnc['CharCode'][0]][item_arr[2]][item_arr[1]] = {};
								
							}
							
							if(currencies_struct[crnc['CharCode'][0]][item_arr[2]][item_arr[1]][item_arr[0]]) {
								
							} else {
								
								currencies_struct[crnc['CharCode'][0]][item_arr[2]][item_arr[1]][item_arr[0]] = {};
								
							}
							
							if(currencies_struct[crnc['CharCode'][0]][item_arr[2]][item_arr[1]][item_arr[0]][crnc['Nominal'][0]]) {
								
							} else {
								
								currencies_struct[crnc['CharCode'][0]][item_arr[2]][item_arr[1]][item_arr[0]][crnc['Nominal'][0]] = value;
								
							}
							
							//console.log(crnc['CharCode'][0], ':', crnc['Value'][0]);
							
						}
						
						//app.saveJSON('currencies/' + crnc['CharCode'][0] + '/data', currencies[crnc['CharCode'][0]]);
						
						app.log.info(item);
						
						callback(null, null);
						
					}
					
					
				});
				
			}
			
		});
		
	});
	
});

tasks.push(function(callback) {
	
	for(var uid in currencies_struct) {
		
		app.saveJSON('currencies/' + uid + '_struct', currencies_struct[uid]);
		
	}
	
	for(var uid in currencies_linear) {
		
		app.saveJSON('currencies/' + uid + '_linear', currencies_linear[uid]);
		
	}
	
	callback(null, null);
	
});

async.series(tasks, function (err, results) {
	
});
