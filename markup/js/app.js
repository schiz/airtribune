/**
 * Main App
 */

define(function (require) {
    "use strict";

    var Marionette = require('marionette'),
        Vent = require('vent'),
        Router = require('routers/router'),

        /** Collections & Models */

        /** Views */
        LoginView = require('views/loginView'),

        /** Custom functions & some hooks */
        Cm = require('custom');

    var App = new Marionette.Application();

    App.addRegions({
        sidebar      : '#sidebar',
        mainPage     : '#main_page',
        mpLoader     : '#main_page_loader',
    });

    App.addInitializer(function(){

        // Start router
        new Router();
        Backbone.history.start();

    });

    App.on("initialize:after", function(options){

        var filterObj = Cm.parseQueryString(Backbone.history.fragment);

        // console.log(filterObj);

        /**
         * Remember the view type
         */
        // if(!filterObj.view) {
        //     var f_view = Cm.getCookie('f_view') || 'list';
        //     filterObj.view = f_view;
        //     Cm.addFilter('view', f_view);
        // }
        if(!filterObj.v) {
            var v = '0';
            Cm.addFilter('v', v);
        }

    });

    return App;

});
