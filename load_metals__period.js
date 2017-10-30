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

//var dates = [];
//var currencies_struct = {};
//var currencies_linear = {};
//var tasks = [];
var metals_struct = {};
var metals_linear = {};

azbn.mdl('web/http').r('GET', 'http://www.cbr.ru/scripts/xml_metall.asp?date_req1=' + argv.start_at + '&date_req2=' + argv.stop_at + '', {}, function(error, response, body){
	
	if(error) {
		
		app.log.error(error);
		
	} else {
		
		parseXML(body, function (_error, _result) {
			
			if(_error) {
				
				app.log.error(_error);
				
			} else {
				
				//app.saveJSON('dates/' + item_arr[2] + '/' + item_arr[1] + '/' + item_arr[0] + '/currencies', _result);
				
				/*
				console.log(_result.Metall.Record[0]);
				
				{
					$ : {
						Date : '05.01.1998',
						Code : '1',
					},
					Buy : [
						'54,08'
					],
					Sell : [
						'56,29'
					],
				}
				
				*/
				
				app.saveJSON('metals/' + (argv.start_at + '_' + argv.stop_at).replace(new RegExp('\/', 'ig'), '.'), _result);
				
				if(_result.Metall.Record.length) {
					
					_result.Metall.Record.forEach(function(item, i, arr){
						
						/*
						1 Золото Au
						2 Серебро Ag
						3 Платина Pt
						4 Палладий Pd
						*/
						
						var date_str = item.$.Date.split('.');
						
						item.Buy[0] = parseFloat(item.Buy[0].replace(',', '.'));
						item.Sell[0] = parseFloat(item.Sell[0].replace(',', '.'));
						
						app.saveJSON('dates/' + date_str[2] + '/' + date_str[1] + '/' + date_str[0] + '/metals_' + item.$.Code, item);
						
						
						if(metals_linear[item.$.Code]) {
							
						} else {
							
							metals_linear[item.$.Code] = {};
							
						}
						
						metals_linear[item.$.Code][ parseInt('' + date_str[2] + '' + date_str[1] + '' + date_str[0] + '') ] = [item.Buy[0], item.Sell[0]];
						
						
						if(metals_struct[item.$.Code]) {
							
						} else {
							
							metals_struct[item.$.Code] = {};
							
						}
						
						if(metals_struct[item.$.Code][date_str[2]]) {
							
						} else {
							
							metals_struct[item.$.Code][date_str[2]] = {};
							
						}
						
						if(metals_struct[item.$.Code][date_str[2]][date_str[1]]) {
							
						} else {
							
							metals_struct[item.$.Code][date_str[2]][date_str[1]] = {};
							
						}
						
						if(metals_struct[item.$.Code][date_str[2]][date_str[1]][date_str[0]]) {
							
						} else {
							
							metals_struct[item.$.Code][date_str[2]][date_str[1]][date_str[0]] = [item.Buy[0], item.Sell[0]];
							
						}
						
						
						app.log.info(item.$.Date);
						
					});
					
				}
				
				for(var uid in metals_struct) {
					
					app.saveJSON('metals/' + uid + '_struct', metals_struct[uid]);
					
				}
				
				for(var uid in metals_linear) {
					
					app.saveJSON('metals/' + uid + '_linear', metals_linear[uid]);
					
				}
				
			}
			
			
		});
		
	}
	
});