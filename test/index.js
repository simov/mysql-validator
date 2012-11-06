
/*
    Execute these commands before running the tests:

    create user 'liolio'@'localhost' identified by 'karamba';
    grant all on `mysql-validator`.* to 'liolio'@'localhost';
*/

require('./mysql');
require('./data-type');

require('./date');
require('./time');
require('./datetime');

require('./number');
// require('./num-point');
