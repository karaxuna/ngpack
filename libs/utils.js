(function(exports){

    var utils = {

        toArray: function(items){
            var c = [];
            for(var i = 0; i < items.length; i++)
                c.push(items[i]);
            return c;
        },

        merge: function (a, b, excludeInstances) {
            var copy = {};
            if(typeof excludeInstances === 'undefined')
                excludeInstances = [Array];
            
            this.extend(copy, a, excludeInstances);
            this.extend(copy, b, excludeInstances);
            return copy;
        },

        extend: function (a, b, excludeInstances) {
            for (var prop in b)
                if (b.hasOwnProperty(prop)) {
                    var isInstanceOfExcluded = false;
                    if (excludeInstances)
                        for (var i = 0; i < excludeInstances.length; i++)
                            if (b[prop] instanceof excludeInstances[i])
                                isInstanceOfExcluded = true;

                    if (typeof b[prop] === 'object' && !isInstanceOfExcluded) {
                        a[prop] = a[prop] !== undefined ? a[prop] : {};
                        this.extend(a[prop], b[prop], excludeInstances);
                    } else
                        a[prop] = b[prop];
                }
        },

        setProp: function(obj, prop, value) {
            var parts = prop.split('.');
            var _ref = obj;
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (i === parts.length - 1)
                    _ref[part] = value;
                else
                    _ref = (_ref[part] = _ref[part] || {});
            }
        },

        getProp: function(obj, prop) {
            var parts = prop.split('.');
            var _ref = obj;
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (i === parts.length - 1)
                    return _ref[part];
                else
                    _ref = _ref[part] || {};
            }
        },

        selectProps: function(obj, props) {
            var newObj = {};
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                utils.setProp(newObj, prop, utils.getProp(obj, prop))
            }
            return newObj;
        },

        each: function(ar, fn) {
            for (var i = 0; i < ar.length; i++)
                if (fn.call(ar, ar[i], i) === false)
                    break;
        },

        map: function(it, fn) {
            if (it instanceof Array)
                return utils.mapArray(it, fn);
            if (it instanceof Object)
                return utils.mapObject(it, fn);
            throw 'typeof parameter is not neither object nor array';
        },

        mapObject: function(obj, fn) {
            var newObj = {};
            for (var prop in obj)
                newObj[prop] = fn(obj[prop]);
            return newObj;
        },

        mapArray: function(ar, fn) {
            var newArray = [];
            for (var i = 0; i < ar.length; i++)
                newArray[i] = fn(ar[i]);
            return newArray;
        },

        findOne: function(ar, query, fn) {
            for (var i = 0; i < ar.length; i++) {
                var a = ar[i];
                var m = utils.matchesQuery(a, query);
                if (m) {
                    if (fn) fn(a, i);
                    return a;
                }
            }
            if (fn) fn(null);
            return null;
        },

        matchesQuery: function(obj, query) {
            switch (typeof query) {
                case 'object':
                    var _r = (function _f(_obj, _query) {
                        for (var prop in _query) {
                            var qprop = _query[prop];
                            var oprop = _obj[prop];
                            if (typeof qprop === 'object')
                                return _f(oprop, qprop);
                            else if (oprop !== qprop)
                                return false;
                        }
                    })(obj, query)
                    return _r !== false;;
                case 'function':
                    return query(obj);
            }
        },

        find: function(ar, query, fn) {
            var results = [];
            for (var i = 0; i < ar.length; i++) {
                var a = ar[i];
                if (utils.matchesQuery(a, query))
                    results.push(a);
            }
            if (fn) fn(results);
            return results;
        },

        contains: function(ar, obj, query) {
            for (var i = 0; i < ar.length; i++) {
                var a = ar[i];
                if (utils.equals(a, obj, query))
                    return true;
            }
            return false;
        },

        any: function(items, query){
            var result = false;
            utils.each(items, function(item){
                if(utils.matchesQuery(item, query)){
                    result = true;
                    return false;
                }
            });
            return result;
        },

        union: function(ar1, ar2, query, fn) {
            var results = [];
            for (var i = 0; i < ar1.length; i++)
                results.push(ar1[i]);
            for (var i = 0; i < ar2.length; i++) {
                var isNotInAr1 = !utils.contains(ar1, ar2[i], query);
                if (isNotInAr1)
                    results.push(ar2[i]);
            };
            if (fn) fn(results);
            return results;
        },

        except: function(ar1, ar2, query, fn) {
            var results = [];
            for (var i = 0; i < ar1.length; i++) {
                var a = ar1[i];
                if (!utils.contains(ar2, a, query))
                    results.push(a);
            }
            if (fn) fn(results);
            return results;
        },

        max: function(ar) {
            var max;
            for (var i = 0; i < ar.length; i++) {
                var a = ar[i];
                if (typeof max === 'undefined' || a > max)
                    max = a;
            }
            return max;
        },

        synchronize: function(ar1, ar2, query) {
            query = query || {};
            // remove items that are in ar1 and are NOT in a2
            utils.except(ar1, ar2, query, function(itemsToRemove) {
                for (var i = 0; i < itemsToRemove.length; i++)
                    utils.remove(ar1, itemsToRemove[i])
            });
            // add items to a1 from a2 that are NOT in a1
            utils.except(ar2, ar1, query, function(itemsToAdd) {
                for (var i = 0; i < itemsToAdd.length; i++)
                    ar1.push(itemsToAdd[i]);
            });
        },

        removeOne: function(ar, query, fn) {
            utils.findOne(ar, query, function(it, index) {
                ar.splice(index, 1);
                if (fn) fn(ar);
            });
        },

        remove: function(ar, item, query, fn) {
            query = query || {};
            for (var i = 0; i < ar.length; i++)
                if (utils.equals(ar[i], item, query))
                    ar.splice(i, 1);
        },

        // note: not deep query search
        equals: function(item1, item2, query) {
            if (typeof item1 === 'object' && typeof item2 === 'object') {
                query = query || {};
                for (var prop in query) {
                    if (item1[prop] !== item2[prop])
                        return false;
                }
                return true;
            }
            return item1 === item2;
        },

        generateGuid: function() {
            var S4 = function() {
                return Math.floor(Math.random() * 0x10000).toString(16);
            };
            return (S4() + S4() + "-" +
                S4() + "-" +
                S4() + "-" +
                S4() + "-" +
                S4() + S4() + S4());
        },

        chain: function(fn){
            return function(){
                fn.apply(this, arguments);
                return this;
            };
        }
    };

    utils.extend(exports, utils);

})(typeof module !== 'undefined' ? module.exports : (window.utils = {}));