
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
        sql += 'insert into `datetime` (`datetime`) values ("'+tests[i]+'");';
    }
    c.query(sql, function (err, result) {
        if (err) throw err;
        c.query('select `datetime` from `datetime`;', function (err, rows) {
            if (err) throw err;
            console.log('');
            for (var j=0; j < tests.length; j++) {
                var err = validator.datetime(tests[j]);
                // print
                console.log('\t'+
                    (!err ? rows[j].datetime.green : rows[j].datetime.red),
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

    describe('DATETIME, TIMESTAMP', function () {
        it('should be well formatted', function (done) {
            testDates(TEST.format, function () {
                done();
            });
        });
        it('should be a valid day of the month', function (done) {
            testDates(TEST.monthDays, function () {
                done();
            });
        });
        it('should be a valid time of the day', function (done) {
            testDates(TEST.dayTime, function () {
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
        // YYYY-MM-DD HH:MM:SS
        '2012-11-04 2:12:14', '2012-11-4 2:2:5', '2012-1-4 00:5:16', 
        // YY-MM-DD HH:MM:SS
        '12-11-04 2:12:14', '99-11-4 2:2:5', '12-1-4 00:5:16',
        // YYYYMMDDHHMMSS
        '20121104021214',
        // YYMMDDHHMMSS
        '121104000514',
        // separator
        '2012~`!@#$%^&*()-_=+{}[]\\|:;<>,.?/11-04 2:12:14',
        '2012-11-04 2~`!@#$%^&*()-_=+{}[]\\|:;<>,.?/12:14',
        '2012-11-04~`!@#$%^&*()-_=+{}[]\\|:;<>,.?/2:12:14',
        // after time
        '2012-11-04 2:12:14 w', '2012-11-04 2:12:14w',
        '121104000514 w', '121104000514w',
        // only date
        '2012-02-28', '2012-02-28w', '2012-02-28 w',
        '20120228'
    ],
    monthDays: [
        // YYYY-MM-DD HH:MM:SS
        '2012-02-28', '2012-02-29', '2012-02-30',
        '2012-11-30', '2012-11-31',
        // YY-MM-DD HH:MM:SS
        '12-02-28', '12-02-29', '12-02-30',
        '12-11-30', '12-11-31',
        // YYYYMMDDHHMMSS
        '20120228', '20120229', '20120230',
        '20121130', '20121131',
        // YYMMDDHHMMSS
        '120228', '120229', '120230',
        '121130', '121131'
    ],
    dayTime: [
        // YYYY-MM-DD HH:MM:SS
        '2012-11-04 4:56:16',
        '2012-11-04 25:56:16', '2012-11-04 4:60:16', '2012-11-04 4:56:60',
        // YY-MM-DD HH:MM:SS
        '12-11-04 25:56:16', '12-11-04 4:56:60', '12-11-04 4:56:60',
        // YYYYMMDDHHMMSS
        '20121104045616',
        '20121104255616', '20121104046016', '20121104045660',
        // YYMMDDHHMMSS
        '121104255616', '121104046016', '121104045660'
    ]
};
 