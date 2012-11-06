
var fs = require('fs');
require('colors');

var mysql = require('mysql'),
    c = mysql.createConnection({
        user: 'liolio',
        password: 'karamba',
        typeCast: false,
        multipleStatements: true
    });

var validator = new (require('../lib/validator').Validator);


function runTest (tests, type, cb) {
    var sql = '';
    for (var i=0; i < tests.length; i++) {
        sql += 'insert into `datatypes` (`'+type+'`) values ("'+tests[i]+'");';
    }
    c.query(sql, function (err, result) {
        if (err) throw err;
        c.query('select `'+type+'` from `datatypes`;', function (err, rows) {
            if (err) throw err;
            console.log('\t'+type.blue.bold);
            function loop (i, cb) {
                if (i == tests.length) {
                    return cb();
                }
                validator.check(tests[i], type, function (err) {
                    // print
                    console.log('\t'+
                        (!err ? rows[i][type].green : rows[i][type].red),
                        tests[i].yellow, 
                        (!err ? 'valid'.green : 'invalid'.red)
                    );
                    // ?
                    loop(++i, cb);
                });
                
            }
            loop(0, function () {
                c.query('delete from `datatypes`;', function (err, result) {
                    if (err) throw err;
                    cb();
                });
            });
        });
    });
}


describe('data type', function () {
    before(function (done) {
        var schema = fs.readFileSync('./test/fixtures/schema.sql', 'utf8');
        c.query(schema, function (err, rows) {
            if (err) throw err;
            done();
        });
    });

    describe('INT', function () {
        it('should be a valid number', function (done) {
            console.log('');
            var keys = Object.keys(TEST);
            function loop (i) {
                if (i == keys.length) {
                    return done();
                }
                runTest(TEST[keys[i]], keys[i], function () {
                    loop(++i);
                });
            }
            loop(0);
        });
    });

    after(function (done) {
        c.query('drop schema `mysql-validator`;', function (err, rows) {
            if (err) throw err;
            done();
        });
    });
});

var TEST = {
    'bigint': [
        '-9223372036854775808', '9223372036854775807',
        '-9223372036854775809', '9223372036854775808'
    ],
    'bigint unsigned': [
        '0', '18446744073709551615',
        '-1', '18446744073709551616'
    ],
    'int': [
        '-2147483648', '2147483647',
        '-2147483649', '2147483648'
    ],
    'int unsigned': [
        '0', '4294967295',
        '-1', '4294967296'
    ],
    'mediumint': [
        '-8388608', '8388607',
        '-8388609', '8388608'
    ],
    'mediumint unsigned': [
        '0', '16777215',
        '-1', '16777216'
    ],
    'smallint': [
        '-32768', '32767',
        '-32769', '32768'
    ],
    'smallint unsigned': [
        '0', '65535',
        '-1', '65536'
    ],
    'tinyint': [
        '-128', '127',
        '-129', '128'
    ],
    'tinyint unsigned': [
        '0', '255',
        '-1', '256'
    ],
    'bit': [
        '1', '64',
        '0', '65'
    ]
};
