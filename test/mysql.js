
/*
    Execute these commands before running the tests:

    create user 'liolio'@'localhost' identified by 'karamba';
    grant all on `mysql-validator`.* to 'liolio'@'localhost';
*/

var fs = require('fs');

var mysql = require('mysql'),
    c = mysql.createConnection({
        user: 'liolio',
        password: 'karamba',
        typeCast: false,
        multipleStatements: true
    });


describe('mysql database', function () {
    before(function (done) {
        var schema = fs.readFileSync('./test/fixtures/schema.sql', 'utf8');
        c.query(schema, function (err, rows) {
            if (err) return done(err);
            done();
        });
    });

    it('should store a record and select it', function (done) {
        c.query('insert into `datatypes` (`date`) values ("2012-11-01");', 
        function (err, result) {
            if (err) return done(err);
            c.query('select `date` from `datatypes` where id='+result.insertId,
            function (err, rows) {
                if (err) return done(err);
                rows[0].date.toString('utf8').should.equal('2012-11-01');
                done();
            });
        });
    });

    after(function (done) {
        c.query('drop schema `mysql-validator`;', function (err, rows) {
            if (err) return done(err);
            done();
        });
    });
});
