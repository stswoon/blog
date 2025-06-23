<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# AngularJS dynamization

```blogEnginePageDate
11 августа 2019
```

Замечу что речь пойдет про AngularJS 1.x. Если хочется сделать динамическое ангуляр приложение, которое в любой момент
может подгрузить что-нибудь еще ангуляр модуль, то просто так это сделать не получится. Например можно сделать два
ангуляр модуля рядом:

```html

<div id="HelloWorldApp" ng-app="HelloWorldApp">
    <div ng-controller="HelloWorldController">
        <h1>{{greeting}}</h1>
    </div>
</div>
<div id="HelloUserApp" ng-app="HelloUserApp">
    </hello-User-Component>
</div>
```

Но нельзя вставить их друг в друга

```html

<div id="HelloWorldApp" ng-app="HelloWorldApp">
    <div id="HelloUserApp" ng-app="HelloUserApp"></div>
</div>
```

По этой же причине нельзя вставить див внутрь ангуляр приложения и потом его запустить. А т.к. почти всегда ангурял
занимает всю страницу, т.е. ng-app цепляют к body или html, то никак нельзя добавить новое приложение к старому, разве
что iframe, но это плохо.

Я долго искал решение и нашел всего одно, поэтому хочу продемонстрировать его здесь, чтобы не потерялось. Исходное
решение - https://stackoverflow.com/a/15292441/7860797. Суть решение добавить новые модули\контроллеры\директивы\сервисы
в существующее ангурял приложение и проинициализировать новые вещи и новый dom элемент, в который оно было вставлено.

```js
// Make module Foo and store $controllerProvider in a global
var controllerProvider = null;
angular.module('Foo', [], function ($controllerProvider) {
    controllerProvider = $controllerProvider;
});
// Bootstrap Foo
angular.bootstrap($('body'), ['Foo']);

// .. time passes ..

// Load javascript file with Ctrl controller
angular.module('Foo').controller('Ctrl', function ($scope, $rootScope) {
    $scope.msg = "It works! rootScope is " + $rootScope.$id +
        ", should be " + $('body').scope().$id;
});
// Load html file with content that uses Ctrl controller
$('

'

).
appendTo('body');

// Register Ctrl controller manually
// If you can reference the controller function directly, just run:
// $controllerProvider.register(controllerName, controllerFunction);
// Note: I haven't found a way to get $controllerProvider at this stage
//    so I keep a reference from when I ran my module config
function registerController(moduleName, controllerName) {
    // Here I cannot get the controller function directly so I
    // need to loop through the module's _invokeQueue to get it
    var queue = angular.module(moduleName)._invokeQueue;
    for (var i = 0; i < queue.length; i++) {
        var call = queue[i];
        if (call[0] == "$controllerProvider" &&
            call[1] == "register" &&
            call[2][0] == controllerName) {
            controllerProvider.register(controllerName, call[2][1]);
        }
    }
}

registerController("Foo", "Ctrl");
// compile the new element
$('body').injector().invoke(function ($compile, $rootScope) {
    $compile($('#ctrl'))($rootScope);
    $rootScope.$apply();
});
```

Отмечу использование приватной переменной `_invokeQueue` для того чтобы инициализировать только новые ангулярные вещи.

Идею можно немного развить сделав start\stop функции, вместо registerController, прибиндить их к `angular.module()` в
процессе config модуля, т.к. в config доступны провайдеры для компиляции. Теперь для динамического добавления вызываем
`angular.module().start()`, добавляем контроллеры\директивы как обычно, `angular.module().stop()` для инициализации.