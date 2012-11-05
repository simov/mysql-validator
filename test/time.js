
var fs = require('fs'),
	moment = require('moment');
require('colors');

var mysql = require('mysql'),
	c = mysql.createConnection({
		user: 'liolio',
		password: 'karamba',
		typeCast: false,
		multipleStatements: true
	});

var validator = new (require('../lib/validator').Validator);


function testDates (tests, cb) {
	var sql = '';
	for (var i=0; i < tests.length; i++) {
		sql += 'insert into `datetime` (`time`) values ("'+tests[i]+'");';
	}
	c.query(sql, function (err, result) {
		if (err) throw err;
		c.query('select `time` from `datetime`;', function (err, rows) {
			if (err) throw err;
			console.log('');
			for (var j=0; j < tests.length; j++) {
				var err = validator.time(tests[j]);
				// print
				console.log('\t'+
					(!err ? rows[j].time.green : rows[j].time.red),
					tests[j].yellow, 
					(!err ? 'valid'.green : 'invalid'.red)
				);
				// ?
			}
			c.query('delete from `datetime`;', function (err, result) {
				if (err) throw err;
				cb();
			});
		});
	});
}


describe('data type', function () {
	before(function (done) {
		c.query('create schema if not exists `mysql-express-admin`;'+ 
				'use `mysql-express-admin`;',
		function (err, rows) {
			if (err) throw err;
			var schema = fs.readFileSync('./test/fixtures/schema.sql', 'utf8');
			c.query(schema, function (err, rows) {
				if (err) throw err;
				done();
			});
		});
	});

	describe('TIME', function () {
		it('should be well formatted', function (done) {
			var tests = TEST.format;
			testDates(tests, function () {
				done();
			});
		});
	});

	after(function (done) {
		c.query('drop schema `mysql-express-admin`;', 
		function (err, rows) {
			if (err) throw err;
			done();
		});
	});
});

var TEST = {
	format: [
		// D HH:MM:SS, D HH:MM, D HH
		'33 24:59:59', '33 24:59', '33 24',
		// HH:MM:SS, HH:MM, SS
		'24:59:59', '24:59', '59',
		'837:59:59', '837:59', '837',
		// HHMMSS
		'245959',
		// HHHMMSS
		'8355959', '8355959w', '8355959 w',
		// single value for hour/minute/second
		'1:2:3',
		// after time
		'33 24:59:59 w', '33 24:59:59w',
		'24:59:59 w', '24:59:59w', 
		'245959w', '245959 w',
		/*invalid*/
		// separator - ~`!@#$%^&*()-_=+{}[]\\|:;<>,.?/
		'24-59-59', '24/59/59', '24.59.59',
		'24~59~59', '24%59%59', '24+59+59',
		'24w59w59', '24:5959',
		'24:59 59', '24 59:59', '24 59 59',
		// out of range
		'839:59:59', '24:60:59', '24:59:60',
		'246059', '245960'
	]
};
