/* JS */

define([
    'jquery',
    'backbone',
    'cookie'

], function ($, Backbone) {
    'use strict';

    /**
     * Underscore plugin : analog compact for arrays
     */
    _.mixin({
        compactObject : function(o) {
            _.each(o, function(v, k){
                if(!v)
                    delete o[k];
            });
            return o;
        }
    });


    var urldecode = function(str) {
        return decodeURIComponent((str + '').replace(/%(?![\da-f]{2})/gi, function () {
            // PHP tolerates poorly formed escape sequences
            return '%25';
        }).replace(/\+/g, '%20'));
    };


    var parseQueryString = function( queryString ) {
        var params = {}, queries, temp, i, l;

        // Split into key/value pairs
        queryString = urldecode(queryString);
        queries = queryString.split("&");

        // Convert the array of strings into an object
        for ( i = 0, l = queries.length; i < l; i++ ) {
            temp = queries[i].split('=');
            params[temp[0]] = temp[1];
        }

        return params;
    };


    var setFilter = function(key, val, multi) {
        multi = multi || false;
        var filter = Backbone.history.fragment;
        var filter_obj = parseQueryString( filter );

        if( multi ) {
            if(filter_obj[key] === undefined) {
                filter_obj[key] = val;
            } else {

                var vals = filter_obj[key].toString().split('-');
                vals.push(val.toString());
                filter_obj[key] = _.uniq(vals).join('-');
                //console.log(vals);

            }
        } else {
            filter_obj[key] = val;
        }

        var new_filter = $.param( _.compactObject( filter_obj ) );

        return new_filter;
    };

    var unsetFilter = function(key, val, multi) {
        multi = multi || false;
        var filter = Backbone.history.fragment;
        var filter_obj = parseQueryString( filter );

        if( multi ) {
            if(filter_obj[key] !== undefined) {
                var vals = filter_obj[key].toString().split('-');

                if( vals.length == 1 ) {
                    delete filter_obj[key];
                } else if( vals.length > 1 ) {

                    vals = _.without(vals, val.toString());
                    filter_obj[key] = _.uniq(vals).join('-');

                }
            }
        } else {
            delete filter_obj[key];
        }

        var new_filter = $.param( _.compactObject( filter_obj ) );

        return new_filter;
    };


    var addFilter = function(key, val, multi) {
        multi = multi || false;
        var new_filter = this.setFilter(key, val, multi);
        
        Backbone.history.navigate(new_filter, {trigger: true});
        return true;
    };


    var addFilters = function(obj, trigger) {
        trigger = trigger !== false;

        var self = this,
            objLength = Object.keys(obj).length,
            counter = 0;

        _.each(obj, function(v, k){
            counter++;

            var new_filter = self.setFilter(k, v);
            Backbone.history.navigate(new_filter, {trigger: false});
            
            if (trigger && counter >= objLength)
                Backbone.history.loadUrl();

        });

        // Backbone.history.stop();
        // Backbone.history.start();

        // Backbone.history.loadUrl();
        // Backbone.history.navigate(Backbone.history.fragment, {trigger: true});
        return true;
    };


    var removeFilter = function(key, val, multi) {
        multi = multi || false;
        var new_filter = this.unsetFilter(key, val, multi);

        Backbone.history.navigate(new_filter, {trigger: true});
        return true;
    };


    var removeFilters = function(obj, trigger) {
        trigger = trigger !== false;

        var self = this,
            objLength = Object.keys(obj).length,
            counter = 0;

        _.each(obj, function(v, k){
            counter++;

            var new_filter = self.unsetFilter(k, v);
            Backbone.history.navigate(new_filter, {trigger: false});
            
            if (trigger && counter >= objLength) 
                Backbone.history.loadUrl();

        });

        return true;
    };


    var checkFilters = function(obj) {
        var output = false;
        // var counter = 0;

        var filter = Backbone.history.fragment;
        var filter_obj = parseQueryString( filter );

        _.each(obj, function(v, k){
            
            if ( _.has(filter_obj, k) )
                output = true;

        });

        return output;
    };


    var getServerQueryString = function(filter) {
        var output = '';
        output = setFilter('current_category', Emart.current_category);

        return output;
    };


    var setCookie = function(key, val) {
        $.cookie(key, val, { expires: 7, path: '/' });
        return true;
    };


    var getCookie = function(key) {
        return $.cookie(key);
    };


    var removeCookie = function(key) {
        $.removeCookie(key, { path: '/' });
        return true;
    };


    var getCorrectStr = function(num, str1, str2, str3) {
        var val = num % 100;

        if (val > 10 && val < 20) return str3;
        else {
            val = num % 10;
            if (val == 1) return str1;
            else if (val > 1 && val < 5) return str2;
            else return str3;
        }
    };


    return {
        urldecode: urldecode,
        parseQueryString: parseQueryString,
        setFilter: setFilter,
        addFilter: addFilter,
        addFilters: addFilters,
        unsetFilter: unsetFilter,
        removeFilter: removeFilter,
        removeFilters: removeFilters,
        checkFilters: checkFilters,
        getServerQueryString: getServerQueryString,

        setCookie: setCookie,
        getCookie: getCookie,
        removeCookie: removeCookie,
        getCorrectStr: getCorrectStr,
    };

});
