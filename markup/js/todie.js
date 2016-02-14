/* JS */

define([
    'jquery',
], function ($) {
    'use strict';

    $("a[href^='#']").click(function(e){
        e.preventDefault();
    });

});
