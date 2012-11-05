
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


function testDates (tests, expected, cb) {
	var sql = '';
	for (var i=0; i < tests.length; i++) {
		sql += 'insert into `datetime` (`date`) values ("'+tests[i]+'");';
	}
	c.query(sql, function (err, result) {
		if (err) throw err;
		c.query('select `date` from `datetime`;', function (err, rows) {
			if (err) throw err;
			console.log('');
			for (var j=0; j < tests.length; j++) {
				var ok = rows[j].date === eval(expected);
				var err = validator.date(tests[j]);
				// print
				console.log('\t'+
					(ok ? rows[j].date.green : rows[j].date.red),
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

	describe('DATE', function () {
		it('should be well formatted', function (done) {
			var dates = TEST.format,
				expected = '"2012-11-02"';
			testDates(dates, expected, function () {
				done();
			});
		});
		it('should be a valid day of the month: YYYY-MM-DD', function (done) {
			var dates = TEST.monthDays1,
				expected = 'test[j]';
			testDates(dates, expected, function () {
				done();
			});
		});
		it('should be a valid day of the month: YY-MM-DD', function (done) {
			var dates = TEST.monthDays2,
				expected = 'moment(test[j], "YY-MM-DD").format("YYYY-MM-DD")';
			testDates(dates, expected, function () {
				done();
			});
		});
		it('should be a valid day of the month: YYYYMMDD', function (done) {
			var dates = TEST.monthDays3,
				expected = 'moment(test[j], "YYYYMMDD").format("YYYY-MM-DD")';
			testDates(dates, expected, function () {
				done();
			});
		});
		it('should be a valid day of the month: YYMMDD', function (done) {
			var dates = TEST.monthDays4,
				expected = 'moment(test[j], "YYMMDD").format("YYYY-MM-DD")';
			testDates(dates, expected, function () {
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
		// YYYY-MM-DD, YY-MM-DD, YYYYMMDD, YYMMDD
		'2012-11-02', '12-11-02', '20121102', '121102', 
		// separator
		'2012~`!@#$%^&*()-_=+{}[]\\|:;<>,.?/11---02', // without " ' space
		'2012w11aa02', '2012-1102',
		'2012*11 02', '2012 11 02',
		// out of range
		'20122-11-02', '2012-13-02', '2012-11-32',
		'201221102', '20121302', '20121132',
		// single value for month/day
		'2012112', '2012-11-2',
		// after date
		'2012-11-02 w', '12-11-02 w', '2012-11-02w', '12-11-02w', 
		'20121102w', '121102w', '20121102 w', '121102 w'
	],
	// monthDays: [
	// 	// YYYY-MM-DD
	// 	'2012-02-28', '2012-02-29', '2012-02-30',
	// 	'2012-11-30', '2012-11-31',
	// 	// YY-MM-DD
	// 	'12-02-28', '12-02-29', '12-02-30',
	// 	'12-11-30', '12-11-31',
	// 	// YYYYMMDD
	// 	'20120228', '20120229', '20120230',
	// 	'20121130', '20121131',
	// 	// YYMMDD
	// 	'120228', '120229', '120230',
	// 	'121130', '121131'
	// ],
	monthDays1: [
		'2012-02-28', '2012-02-29', '2012-02-30',
		'2012-11-30', '2012-11-31'
	],
	monthDays2: [
		'12-02-28', '12-02-29', '12-02-30',
		'12-11-30', '12-11-31'
	],
	monthDays3: [
		'20120228', '20120229', '20120230',
		'20121130', '20121131'
	],
	monthDays4: [
		'120228', '120229', '120230',
		'121130', '121131'
	]
};
