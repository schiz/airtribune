require.config({
    // baseUrl: '../vendor/',
    urlArgs: 'bust=' + (new Date()).getTime(), // For disable cache
    waitSeconds: 0,
    paths: {
        'jquery'                  : '../vendor/jquery/dist/jquery',
        'cookie'                  : '../vendor/jquery.cookie/jquery.cookie',
        'underscore'              : '../vendor/underscore/underscore',
        'backbone'                : '../vendor/backbone/backbone',
        'tpl'                     : '../vendor/requirejs-tpl/tpl',
        'marionette'              : '../vendor/backbone.marionette/lib/backbone.marionette',
        'bootstrap'               : '../vendor/bootstrap/dist/js/bootstrap.min',
        'moment'                  : '../vendor/moment/min/moment-with-langs.min',
        'knockout'                : '../vendor/knockout/dist/knockout',
        'domReady'                : '../vendor/requirejs-domready/domReady',
        'EventEmitter'            : '../vendor/EventEmitter/EventEmitter',
        'jqueryPh'                : '../vendor/jquery-placeholder/jquery.placeholder',
        'async'                   : '../vendor/requirejs-plugins/src/async',
        'selectordie'             : '../vendor/selectordie/_src/selectordie.min'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'marionette' : {
            deps : ['jquery', 'underscore', 'backbone'],
            exports : 'Marionette'
        },
        'bootstrap': ['jquery'],
        'jqueryPh': ['jquery'],
        'selectordie': ['jquery'],
    }
});

/* 
    Порядок работы виджета: 
        - Файл виджета находится в widgets/имявиджета
        - После загрузки кода в виджет примешивается прототип eventEmitter
        - Создается новый виджет
        - Если при создании (или в прототипе) прописана переменная this.async=true, в виджете должно емититься событие init после того, как все его ресурсы будут загружены
        - После этого виджет биндится к шаблону
        - Затем эмитится событие domReady
*/

require(['domReady!','jquery','knockout','EventEmitter','dataProvider','jqueryPh'],function(doc,$,ko,EventEmitter,DataProvider,jqueryPh) {
    $('input').placeholder(); // placeholder-хук для IE

    var user = {auth:false};  // TODO: здесь будет юзер, ajax-авторизация или другая, в итоге получим объект с какими-то параметрами, который будет общий, и будет передаваться во все виджеты
    var eventEmitter = new EventEmitter();  // Этот объект тоже глобальный по всем виджетам - виджеты через него общаются
    var dataProvider = new DataProvider(window.ATDATA);
    $(doc).find('.require-js-model').each(function() {
        var dom = this, params = $(dom).data('params');
        params && params.name && require(['widgets/'+params.name],function(Model) {
            $.extend(Model.prototype,EventEmitter.prototype);
            var model = new Model($.extend({},params,{domNode:dom,eventEmitter:eventEmitter,user:user,dataProvider:dataProvider}));
            var callback = function() {
                ko.applyBindings(model,dom);
                model.emit('domReady');
            }
            model.async ? model.on('init',callback) : callback();
        });
    });
});
