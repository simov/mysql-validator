
var moment = require('moment'),
    bignum = require('bignum');
var dataType = new (require('./data-type').DataType);


function Validator () {
    
}

Validator.prototype.check = function (value, type, cb) {
    var self = this;
    dataType.get(type, function (type) {
        var func = self.type(type.name);
        cb(self[func](value, type));
    });
}

Validator.prototype.type = function (type) {
    var func = '';
    switch (true) {
        case /tinyint|smallint|mediumint|integer|bigint|int|bit|select/i.test(type):
            func = 'exact';
            break;
        case /decimal|numeric/i.test(type):
            func = 'fixedPoint';
            break;
        case /real|double|float/i.test(type):
            func = 'approximate';
            break;
        case /varchar|char/i.test(type):
            func = 'char';
            break;
        case /tinytext|mediumtext|longtext|text/i.test(type):
            func = 'text';
            break;
        case /date|year/i.test(type):
            func = 'date';
            break;
        case /time/i.test(type):
            func = 'time';
            break;
        case /datetime|timestamp/i.test(type):
            func = 'datetime';
            break;
        case /enum|set/i.test(type):
            func = 'enum';
            break;
    }
    return func;
}

Validator.prototype.exact = function (value, type) {
    var num = parseInt(value);
    if (isNaN(num)) {
        return { message: 'not valid' };
    } else {
        var range = NUMBER[type.name][type.unsigned?'unsigned':'signed'];
        if (type.name.match(/bigint/i)) {
            num = bignum(value);
            return (num.ge(range.min) && num.le(range.max)) ? null
                : new Error('out of range');
        } else {
            return (num >= range.min && num <= range.max) ? null
                : new Error('out of range');
        }
    }
}

Validator.prototype.fixedPoint = function (value, type) {
    var num = parseFloat(value);
    if (isNaN(num)) {
        return { message: 'not valid' };
    } else {
        if (type.value && type.value.length) {
            var range = createRange(type);
            return (num >= range.min && num <= range.max) ? null
                : new Error('out of range');
        } else {
            // no validation - uses default system/database ranges
            return null;
        }
    }
}

Validator.prototype.approximate = function (value, type) {
    // for now it will use the fixed point validation
    this.fixedPoint(value, type);
}

Validator.prototype.char = function (value, type) {
    if (type.value.length) {
        return (value.length < type.value[0]) ? null
        : new Error('out of range');
    } else {
        // no validation - uses default system/database ranges
        return null;
    }
}

Validator.prototype.text = function (value, type) {
    if (type.name === 'tinytext') {
        return (value.length < 255) ? null
        : new Error('out of range');
    } else {
        // no validation - text:0-64Kb,meduimtext:0-16Mb,longtext:0-4Gb
        return null;
    }
}

Validator.prototype.date = function (value, type) {
    var regex = REGEX.date;
    for (var i=0; i < regex.length; i++) {
        if (regex[i].test(value)) {
            var length = regex[i].exec(value)[1].length,
                format = i == 0
                ? (length == 4 ? 'YYYY-MM-DD' : 'YY-MM-DD')
                : (length == 4 ? 'YYYYMMDD' : 'YYMMDD');		
            if (moment(value, format).isValid()) return null;
        }
    }
    return new Error('malformed');
}

Validator.prototype.time = function (value, type) {
    var regex = REGEX.time;
    for (var i=0; i < regex.length; i++) {
        if (regex[i].test(value)) return null;
    }
    return new Error('malformed');
}

Validator.prototype.datetime = function (value, type) {
    var regex = REGEX.datetime;
    for (var i=0; i < regex.length; i++) {
        if (regex[i].test(value)) {
            var match = regex[i].exec(value),
                time = match[5],
                length = match[1].length,
                format = 
                i == 0
                ? (length == 4 
                    ? (time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
                    : (time ? 'YY-MM-DD HH:mm:ss' : 'YY-MM-DD'))
                : (length == 4 
                    ? (time ? 'YYYYMMDDHHmmss' : 'YYYYMMDD') 
                    : (time ? 'YYMMDDHHmmss' : 'YYMMDD'));
            if (moment(value, format).isValid()) return null;
        }
    }
    return new Error('malformed');
}

Validator.prototype.enum = function (value, type) {
    // not implemented
    return null;
}

exports.Validator = Validator;


// private api

function createRange (type) {
    // example:
    // type.value = [6,2]
    // min: -9999.99
    // max: 9999.99
    // type.value = [6,2] unsigned
    // min: 0
    // max: 9999.99
    function gen (length) {
        var str = '';
        for (var i=0; i < length; i++) {
            str += '9';
        }
        return str;
    }
    var m = type.value[0],
        d = type.value[1] ? type.value[1] : 0;
    m = gen(m-d), d = gen(d);
    var num = parseFloat(m+'.'+d);
    return type.unsigned 
        ? { min: 0, max: num }
        : { min: num*(-1), max: num };
}


var REGEX = {
    // DATE
    date: [	
        // YYYY|YY-MM|M-DD|D
        new RegExp(
            '^(\\d{4}|\\d{2})'+ 			// year YYYY|YY
            '[^a-zA-Z\\d\\s]+'+ 			// separator
            '(1[0-2]|0?[0-9])'+ 			// month 1-12
            '[^a-zA-Z\\d\\s]+'+ 			// separator
            '(3[0-1]|(1|2)[0-9]|0?[0-9])'+	// day 1-31
            '[^\\d]*$'						// anything but number at the end
        , 'i'),
        // YYYY|YYMMDD
        new RegExp(
            '^(\\d{4}|\\d{2})'+ 			// year YYYY|YY
            '(1[0-2]|0[0-9])'+ 				// month 01-12
            '(3[0-1]|(0|1|2)[0-9])$'		// day 01-31
        , 'i')
    ],
    // TIME
    time: [
        // D? H|HH:M|MM:S|SS, D? H|HH:M|MM, D? H|HH
        new RegExp(
            '^((3[0-4]|[0-2]?[0-9])\\s)?'+	// day 0-34
            '(2[0-4]|[0-1]?[0-9])'+				// hour 0-24
            '(:'+								// separator
            '([0-5]?[0-9]))?'+					// minute 0-59?
            '(:'+								// separator
            '([0-5]?[0-9]))?'+					// second 0-59?
            '[^\\d]*$'							// anything but number at the end
        , 'i'),
        // H|HH|HHH:M|MM:S|SS, H|HH|HHH:M|MM
        new RegExp(
            '^(8[0-3][0-8]|[0-7]?[0-9]?[0-9]?)'+// hour 0-838
            ':'+								// separator
            '([0-5]?[0-9])'+					// minute 0-59
            '(:'+								// separator
            '([0-5]?[0-9]))?'+					// second 0-59?
            '[^\\d]*$'							// anything but number at the end
        , 'i'),
        // HH|HHHMMSS
        new RegExp(
            '^(8[0-3][0-8]|[0-7]?[0-9][0-9])'+	// hour 00-838
            '([0-5][0-9])'+						// minute 00-59
            '([0-5][0-9])'+						// second 00-59
            '[^\\d]*$'							// anything but number at the end
        , 'i'),
        // SS
        new RegExp(
            '^[0-5]?[0-9]$'						// second 0-59
        , 'i')
    ],
    // DATETIME, TIMESTAMP
    datetime: [
        // YYYY|YY-MM|M-DD|D HH|H:MM|M:SS|S
        new RegExp(
            '^(\\d{4}|\\d{2})'+ 			// year YYYY|YY
            '[^a-zA-Z\\d]+'+ 				// separator
            '(1[0-2]|0?[0-9])'+ 			// month 1-12
            '[^a-zA-Z\\d]+'+ 				// separator
            '(3[0-1]|(1|2)[0-9]|0?[0-9])'+	// day 1-31

            '([^a-zA-Z\\d]+'+ 				// separator
            '(2[0-4]|[0-1]?[0-9])'+			// hour 0-24
            '[^a-zA-Z\\d]+'+ 				// separator
            '([0-5]?[0-9])'+				// minute 0-59
            '[^a-zA-Z\\d]+'+ 				// separator
            '([0-5]?[0-9]))?'+				// second 0-59
            '[^\\d]*$'						// anything but number at the end
        , 'i'),
        // YYYY|YYMMDDHHMMSS
        new RegExp(
            '^(\\d{4}|\\d{2})'+				// year YYYY|YY
            '(1[0-2]|0[0-9])'+ 				// month 01-12
            '(3[0-1]|(0|1|2)[0-9])'+		// day 01-31
            
            '((2[0-4]|[0-1][0-9])'+			// hour 0-24
            '([0-5][0-9])'+					// minute 00-59
            '([0-5][0-9]))?$'				// second 00-59
        , 'i')
    ]
};

var NUMBER = {
    int: {
        signed: { min: -2147483648, max: 2147483647 },
        unsigned: { min: 0, max: 4294967295 }
    },
    integer: {
        signed: { min: -2147483648, max: 2147483647 },
        unsigned: { min: 0, max: 4294967295 }
    },
    mediumint: {
        signed: { min: -8388608, max: 8388607 },
        unsigned: { min: 0, max: 16777215 }
    },
    smallint: {
        signed: { min: -32768, max: 32767 },
        unsigned: { min: 0, max: 65535 }
    },
    tinyint: {
        signed: { min: -128, max: 127 },
        unsigned: { min: 0, max: 255 }
    },
    bit: {
        signed: { min: 1, max: 64 }
    },
    bigint: {
        signed: { min: bignum('-9223372036854775808'),
                max: bignum('9223372036854775807') },
        unsigned: { min: 0, max: bignum('18446744073709551615') }
    }
}
