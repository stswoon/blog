<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# JS Class with private

```blogEnginePageDate
02 октября 2019
```

К сожалению JavaScript и Java одинаковы лишь первыми 4 буквами. Так например появление классов в ES6 это лишь иллюзия,
никаких private\protected переменных и методов оно не принесло, но стоит отметить что код стало писать просто, не нужно
запоминать эти старые подходы с прототипированием:

```js
function inherit(ChildClass, ParentClass) {
    function tmp() {
    };
    tmp.prototype = ParentClass.prototype;
    ChildClass.prototype = new tmp();
    ChildClass.prototype.constructor = ChildClass;
    ChildClass.prototype.super = ParentClass.prototype;
}

(function () {
    function ParentClass(name) {
        this.name = name;
    }

    ParentClass.prototype.printName = function () {
        console.log(this.name);
    };

    function ChildClass(name) {
        this.super.constructor.call(this, name + "qqq");
    }

    ChildClass.prototype.newPrintName = function () {
        this.method();
    };
    inherit(ChildClass, ParentClass);

    window.ParentClass = ParentClass;
    window.ChildClass = ChildClass;
}());

var childClass = new ChildClass("Olga");
childClass.printName();
console.log(childClass.name);
```

Правда у прототипирования была возможность делать приватные функции и даже иногда переменные через замыкание.
Альтернатива, которая является стандартом именовать private\protected подчеркиванием, например `_privateParam`, но это
слишком загромождает объекты не нужной чепухой.

Поэтому хотелось бы объединить два подхода писать: писать классы ES6, но иметь и приватные функции и по возможности
переменные без "_"

Проанализировав литературу я остановился на следующем подходе https://stackoverflow.com/a/33533611/7860797 через Scoped
WeakMap. Чуть доточив под себя у меня получился такой вариант.

```js
let Car = (function () {
  //private params
  let privateProps = new WeakMap();
  //just to save some letters
  function pp(bind, set) {
    if (set) privateProps.set(bind, set);
    return privateProps.get(bind)
  };

  //private func should be called via 
  //'call' to bind this
  function printSpeed(text) { 
    console.log(text + pp(this).speed);
  }

  class Car {
    constructor(name, speed) {
      pp(this, {}); //init private storage
      this.name = name;
      pp(this).speed = speed;
    }
    name() {
      console.log(this.name);
    }
    speed() {
      console.log(this.name+": "+pp(this).speed);
      printSpeed
        .call(this, "Speed from private func: ");
    }
    addSpeed() {
      pp(this).speed += 10;
    }
  }
  return Car;
})();
```

Код для тестов

```js
let lada = new Car('lada', 10);
lada.speed();
var bmw = new Car('bmw', 20);
bmw.speed();
lada.speed();

bmw.addSpeed();
bmw.speed();
lada.speed();

class BrokenCar extends Car {
  speed() {
    super.speed();
    console.log("failed")
  }
}
let brokenCar = new BrokenCar("test", 0);
brokenCar.speed();
```

Консоль
```
lada: 10
Speed from private function: 10
bmw: 20
Speed from private function: 20
lada: 10
Speed from private function: 10
bmw: 30
Speed from private function: 30
test: 0
Speed from private function: 0
failed
```

##### Ложка мёда напоследок
Приватные поля в ожидании апрува - https://medium.com/devschacht/javascripts-new-private-class-fields-c60daffe361b

##### Литература
* https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Classes
* http://javascript.crockford.com/private.html
* http://2ality.com/2016/01/private-data-classes.html
* http://disq.us/p/19wzvh3
* http://javascript.ru/tutorial/object/inheritance#factory
* https://habrahabr.ru/post/175029/
* http://javascript.ru/tutorial/object/inheritance#nasledovanie-na-klassah-funkciya-extend
* https://stackoverflow.com/a/33533611/7860797
* https://learn.javascript.ru/es-class
* https://stackoverflow.com/questions/27849064/how-to-implement-private-method-in-es6-class-with-traceur
* https://stackoverflow.com/questions/22156326/private-properties-in-javascript-es6-classes

Инструмент для подсветки - http://pinetools.com/syntax-highlighter