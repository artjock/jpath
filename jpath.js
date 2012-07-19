(function() {

// var jpath = function() {};
var jpath = function() {
    var a = 1;
};


if (typeof exports !== 'undefined') {
    exports = jpath;
} else {
    window.jpath = jpath;
}

(function() {
jpath.extend = function(to, from) {
    if (!from) {
        from = to;
        to = {};
    }

    for (var key in from) {
        to[key] = from[key];
    }

    return to;
};

jpath.util = jpath.extend({
    /**
     * Прокидывает параметр в вызов функции
     * @param {Function} func
     * @param {Object} param
     */
    carry: function(func) {
        var slice = Array.prototype.slice;
        var carries = slice.call(arguments, 1);
        return function() {
            func.apply(null, carries.concat( slice.apply(arguments) ));
        }
    },

    /**
     * Удаляет все undefined из массива
     * @param {Array} arr
     * @type Array
     */
    compact: function(arr) {
        var res = [];

        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] !== undefined) {
                res.push(arr[i]);
            }
        }

        return res;
    },

    /**
     * Делает массивы плоскими
     * @param {Array} arr
     * @type Array
     */
    flatten: function(arr) {
        var res = [];

        for (var i = 0, l = arr.length; i < l; i++) {
            res = res.concat(arr[i]);
        }

        return res;
    }

});
})();

jpath.operators = [
    {
        '!': ''
    }
];

(function(){

/**
 * Регулярка для сплита jpath-a в шаги
 * @example
 *  '.foo[.bar].loo' -> ['foo[.bar]', 'loo'];
 * @type RegExp
 */
var reSplit = /\.(?![^\[]+\])/;

/**
 * Извелекает содержимое предиката
 * @type RegExp
 */
var rePredicate = /([^\[]+)\[([^\]]+)\]/;

/**
 * Регулярные выражения для извлечения
 * и группировки токенов из предиката
 * @type Object
 */
var reTokens = {
    'string': /("|')([^\1]*)\1/g,
    'node': /\.([^=.\s]*)/g,
    'index': /(\d+)/g,
    'operator': /(==|!=|!)/g
};

/**
 * Используется для заполнения строки предиката пробелами,
 * когда из него извлекаются значения
 * @type String
 */
var placeholder = Array(100).join(' ');

var replace = function(result, type, self, match, index) {
    if (typeof index != 'number') {
        match = index;
        index = arguments[5];
    }

    result[index] = [type, type == 'index' ? match-0 : match];

    return placeholder.substr(0, self.length);
};

/**
 * Заменяет операции в предикатах функциями
 * @param {Array} tokens
 * @type Array
 */
var regroup = function(tokens) {
};

/**
 * Сплитит jpath в массив,
 * который потом используется для поиска по json-у
 * @example
 *  '.foo' -> ['node', 'foo']
 *  '.foo[.bar]' -> ['node', 'foo', 'pred', ['node', 'bar']]
 */
jpath.split = function(path) {
    var step;
    var result = [];
    var carry = jpath.util.carry;
    var flatten = jpath.util.flatten;
    var compact = jpath.util.compact;
    var steps = path.split(reSplit).slice(1);

    while (step = steps.shift()) {
        var match = step.match(rePredicate);

        // если удалось извлечь предикат
        if (match) {
            result.push('node', match[1]);
            var tokens = [];
            for (var type in reTokens) {
                match[2].replace(reTokens[type], carry(replace, tokens, type));
            }
            tokens = flatten(compact(tokens));

            result.push('predicate');
            result.push(tokens);

        } else {
            result.push('node', step);
        }
    }

    return result;
};

})();

jpath.predicate = function() {};

jpath.exec = function() {};


})();
