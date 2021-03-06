
var types = [
    {regex: /(bit|binary)(?:\s*\(\s*(\d+)\s*\))?/i, 																	options: {value: 2}},
    {regex: /(tinyint|smallint|mediumint|integer|int|bigint)(?:\s*\(\s*(\d+)\s*\))?(\s+unsigned)?(\s+zerofill)?/i, 		options: {value: 2, unsigned: 3, zerofill: 4}},
    {regex: /(real|double|float)(?:\s*\(\s*(\d+\s*,\s*\d+)\s*\))?(\s+unsigned)?(\s+zerofill)?/i, 						options: {value: 2, unsigned: 3, zerofill: 4}},
    {regex: /(decimal|numeric)(?:\s*\(\s*(\d+(?:\s*,\s*\d+)?)\s*\))?(\s+unsigned)?(\s+zerofill)?/i, 					options: {value: 2, unsigned: 3, zerofill: 4}},
    {regex: /(datetime|date|timestamp|time|year|tinyblob|blob|mediumblob|longblob)/i, 									options: {}},
    {regex: /(varchar)\s*\(\s*(\d+)\s*\)(?:\s+character\s+set\s+(\w+))?(?:\s+collate\s+(\w+))?/i, 						options: {value: 2, characterSet: 3, collate: 4}},
    {regex: /(char)(?:\s*\(\s*(\d+)\s*\))?(?:\s+character\s+set\s+(\w+))?(?:\s+collate\s+(\w+))?/i, 					options: {value: 2, characterSet: 3, collate: 4}},
    {regex: /(varbinary)\s*\(\s*(\d+)\s*\)/i, 																			options: {value: 2}},
    {regex: /(tinytext|text|mediumtext|longtext)(\s+binary)?(?:\s+character\s+set\s+(\w+))?(?:\s+collate\s+(\w+))?/i,	options: {binary: 2, characterSet: 3, collate: 4}},
    {regex: /(enum|set)\s*\(\s*(.+)\s*\)(?:\s+character\s+set\s+(\w+))?(?:\s+collate\s+(\w+))?/i, 						options: {values: 2, characterSet: 3, collate: 4}}
];

exports.get = function (sql) {
    for (var i=0; i < types.length; i++) {
        var type = types[i],
            match = sql.match(type.regex);
        if (match) {
            var dataType = {name: match[1]};
            for (var key in type.options) {
                var index = type.options[key];
                if (match[index]) {
                    var value = null;
                    switch (key) {
                        case 'value': value = numbers(match[index]); break;
                        case 'unsigned': case 'zerofill': case 'binary': value = true; break;
                        case 'characterSet': case 'collate': case 'binary': value = match[index]; break;
                        case 'values': value = strings(match[index]); break;
                    }
                    dataType[key] = value;
                }
            }
            return dataType;
        }
    }
}

function numbers (str) {
    var values = str.split(',');
    for (var i=0; i < values.length; i++) {
        values[i] = parseInt(values[i], 10);
    }
    return values;
}

function strings (str) {
    var values = str.split(',');
    for (var i=0; i < values.length; i++) {
        values[i] = values[i].replace(/(`|'|")/gi, '');
    }
    return values;
}
