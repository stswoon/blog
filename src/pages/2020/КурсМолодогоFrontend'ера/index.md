<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Курс молодого Frontend'ера

```blogEnginePageDate
10 декабря 2020
```

На рабоче часто стал сталкиваться с одними и теми же ошибками разработчиков поэтому решил написать список литературы для
чтения, которые мне помогли и микротестирование на эти знания, где чаще всего происходят ошибки, чтобы убрать сэкономить
на ревью кода и там не описывать все что есть здесь.

## JavaScript

1. https://habr.com/ru/post/305900/
2. https://habr.com/ru/post/460741/
3. https://babeljs.io/docs/en/learn/
4. https://egghead.io/lessons/javascript-const-declarations-in-es6-es2015
5. Выразительный Javascript - https://habr.com/ru/post/253101/

**Вопрос 1**: Написать функцию суммирования в виде `f(3)(2) // return 5`

**Ответ 1.1**:

```js
function f(a) {
    return function (b) {
        return a + b;
    }
}
```

**Ответ 1.2**: используется часто в React - HOC, также можно исплользовать в замыканиях, например для bind или для
задачи ниже.

**Вопрос 2**: Исправить ошибку

```js
function makeArmy() {
    var shooters = [];
    for (var i = 0; i < 10; i++) {
        var shooter = function () {
            console.log(i);
        };
        shooters.push(shooter);
    }
    return shooters;
}

var army = makeArmy();
army[0](); // 10 instead of 0
army[5](); // 10 instead of 5
army[9](); // 10 instead of 9
```

**Ответ 2.1**: через let

```
for(var i = 0; i < 10; i++)  --->    for(let i = 0; i < 10; i++)
```

когда выполняется блок кода for (let i=0...) {...}, для него создаётся новое лексическое окружение с соответствующей
переменной i.

**Ответ 2.2**: через замыкание

```js
function makeArmy() {
    var shooters = [];
    for (var i = 0; i < 10; i++) {
        var shooter = (function (i) {
            return function () {
                console.log(i);
            }
        })(i);
        shooters.push(shooter);
    }
    return shooters;
}
```

**Ответ 2.3**: https://learn.javascript.ru/task/make-army

## TypeScript

1. https://www.typescriptlang.org/docs/handbook/basic-types.html (там много тем нужно разворачивать до конца)
2. https://xsltdev.ru/typescript/handbook/variable-declarations/#scoping - тоже самое но на русском

**Вопрос 1**: реализовать StringMap вида

```
mymap["a"] = "value"
mymap["a"] = 1 //error type not string
```

**Ответ 1**:

```ts
type StringMap = {
    [key: string]: string;
};
```

**Вопрос 2**: key каким может быть в решение выше?

**Ответ 2**: int, string, в отдельном классе Map ключи уже могут быть объектами

**Вопрос 3**: для чего нужны генерики? пример генериков?

**Ответ 3**: для типизации объектов в структуре, например array<T>

**Вопрос 4**: Переделать StringMap из решения 1 в generic

**Ответ 4**:

```ts
type Map<T> = {
    [x: string]: T;
};
```

**Вопрос 5**: Что вернет код?

```ts
function checkGrants(user: User) {
    if (user instanceof AdminUser) {
        return true;
    }
    return false;
}

class AdminUser extends User {
    name: string
}

const adminUser2: AdminUser = {name: "admin"} //no error
checkGrants(new AdminUser("admin")) //?
checkGrants(adminUser2) //?
```

**Ответ 5**: true, false

**Вопрос 6**: Как его исправить?

**Ответ 6.1**: Утиная типизация

```ts
class AdminUser extends User {
    isAdmin: boolean = true
}

const adminUser2: AdminUser = {name: "admin", isAdmin: true}
```

**Ответ 6.2**: Часто такое может встретиться при преобразование респонса из строки в объект

**Ответ 6.3**: https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards

## RxJs

1. https://egghead.io/courses/save-time-avoiding-common-mistakes-using-rxjs - лучший вариант для знакомства, на мой
   взгляд
2. код для курса выше - https://github.com/eggheadio-projects/save-time-avoiding-common-mistakes-using-rxjs
3. https://medium.com/@toshabely/rxjs-%D1%81-%D0%BD%D1%83%D0%BB%D1%8F-%D0%BE%D0%B1%D0%B7%D0%BE%D1%80-%D0%BE%D0%B1%D0%BE%D0%B7%D1%80%D0%B5%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8F-ca4d8e5fb386
4. https://www.youtube.com/watch?v=my6-qDYSk7E

**Вопрос 1**: Как лучше переписать код?

```js
const click$ = Rx.Observable.fromEvent(document, 'click');
const x$ = new Rx.Subject();
click$.subscribe((ev) => {
    x$.next(ev.clientX);
});
x$.subscribe((clientX) => {
    console.log(clientX);
});
```

**Ответ 1**:

```js
const click$ = Rx.Observable.fromEvent(document, 'click');
const x$ = click$.map(ev => ev.clientX);
x$.subscribe((clientX) => {
    console.log(clientX);
});
```

**Вопрос 2**: В чем отличие mergeMap vs switchMap?

**Ответ 2.1**: В основном лучше всегда пользоваться switchMap, т.к. mergeMap создает новый обсервабл и не закрывает
старый

**Ответ 2.2**: С mergeMap несколько кликов создают несколько последовательностей а не переключаются на одну новую как
хотелось бы, см https://jsbin.com/faroziyixo/edit?html,console,output

```html

<script
        src="https://cdnjs.cloudflare.com/ajax/libs/rxjs/6.5.4/rxjs.umd.js">
</script>
<script>
    const click$ = rxjs.fromEvent(document, 'click');
    const tickWhenClick$ = click$.pipe(
            rxjs.operators.mergeMap(ev => rxjs.interval(1000)) //correct switchMap
    );
    tickWhenClick$.subscribe((x) => {
        console.log(x)
    });
</script>
```

**Вопрос 3**: Как лучше написать код?

```js
a$.subscribe(aData => {
    api.get$(aData).subscribe(bData => {
        console.log(bData)
    })
});
```

**Ответ 3**:

```js
a$.switchMap(aData => {
    return api.get$(aData)
}).subscribe(bData => {
    console.log(bData)
});
```

**Вопрос 4**: можно ли использовать tap чтобы передать данные в какой-нить сервис?

```js
a$
    .tap((value) => {
        someServiceB.set(value)
    })
    .subscribe((value) => {
        someServiceA.set(value)
    })
```

**Ответ 4**: Нет - приемник всегда один - сайдэффекты должны быть только в subscribe иначе потом все запутается

```js
a$
    .tap((value) => {
        console.log(value)
    })
    .subscribe((value) => {
        someServiceA.set(value);
        someServiceB.set(value);
    })
```

## Angular

1. https://books.ninja-squad.com/angular
2. https://egghead.io/courses/create-dynamic-components-in-angular
3. https://egghead.io/courses/understand-angular-directives-in-depth
4. https://egghead.io/courses/learn-the-basics-of-angular-forms
5. https://egghead.io/courses/angular-dependency-injection-di-explained
6. https://egghead.io/courses/manage-ui-state-with-the-angular-router
7. https://angular.io/docs

**Вопрос 1**: как сделать `<div *ngIf *ngFor />` ?

**Ответ 1.1**:

```
<ng-template [ngIf]="">
  <div *ngFor=""></div>
</ng-template>
```

**Ответ 1.2**:

* https://stackoverflow.com/questions/34657821/ngif-and-ngfor-on-same-element-causing-error
* http://coldfox.ru/article/5c82d887bbf20e61c12c7349/%D0%94%D0%B8%D1%80%D0%B5%D0%BA%D1%82%D0%B8%D0%B2%D1%8B-ng-template-ngTemplateOutlet-%D0%B8-ng-container
* https://ru.stackoverflow.com/questions/989805/%D0%A7%D0%B5%D0%BC-ng-container-%D0%BE%D1%82%D0%BB%D0%B8%D1%87%D0%B0%D0%B5%D1%82%D1%81%D1%8F-%D0%BE%D1%82-ng-template
* https://tyapk.ru/blog/post/ng-container-vs-ng-template

**Вопрос 2**: Как создать динамическую компоненту?

**Ответ 2.1**:

* https://angular.io/guide/dynamic-component-loader
* https://medium.com/@lukaonik/how-to-create-dynamic-components-in-angular-a2f449acb987

**Ответ 2.2**:

```ts

@Component({
    selector: 'app-root',
    template: '<div #placeholder/></div>'
})
class HostComponent {
    @ViewChild('placeholder') placeholder: ElementRef;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    }

    loadComponent() {
        const componentFactory = this.componentFactoryResolver
            .resolveComponentFactory(MyDynamicComponent);
        const viewContainerRef = this.placeholder.viewContainerRef;
        const componentRef: ComponentRef<MyDynamicComponent> = viewContainerRef
            .createComponent<MyDynamicComponent>(componentFactory);
        componentRef.instance.someInputData = "some data";
    }
}
```

**Вопрос 3**: Что здесь плохого?

```
private print() {
   let a, b;
   this.translate.get("transUnitA").subscribe(v => a = v);
   this.translate.get("transUnitB").subscribe(v => b = v);
   this.innerHtml = a + "_" + b;
}
```

**Ответ 3.1**: racecondition

```
private print() {
   let a, b;
   this.translate
      .get(["transUnitA", "transUnitB"]).subscribe([a,b] => {
          this.innerHtml = a + "_" + b;
      });
}
```

**Ответ 3.2**: memory leak

```
private print() {
   let a, b;
   this.subscription = this.translate
      .get(["transUnitA", "transUnitB"]).subscribe([a,b] => {
         this.innerHtml = a + "_" + b;
       });
}
private onNgDestroy() {
   this.subscription.unsubscribe();
}
```

**Вопрос 4**: Что здесь может быть плохого?
```
@Input() model;
private change(name) {
   this.model.name = name;
}
```

**Ответ 4**: не соблюдение принципа неизменяемости данных
```
private change(name) {
   //new object will work with shallow equals
   this.model = {...model, name};
}
```

