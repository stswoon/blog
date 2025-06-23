<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Angular динамизация

```blogEnginePageDate
06 ноября 2019
```

Сейчас появилось довольно много способов для решения данной проблемы - angular elements, angular portals, entry
components - но расскажу о том, который может быть использован в angular6+.

Задача: есть CMS, которая отдает html layout с разным набором angular компонент. Нужно запустить angular приложение для
динамического layout.

Пример страницы 1:

```html

<body>
<app-landing></app-landing>
</body>
```

Пример страницы 2:

```html

<body>
<div class="header">
    <app-header></app-header>
</div>
<app-product-details></app-product-details>
</body>
```

В главном модуле ng-приложения пишем примерно такой код

```ts
prepareDom();

@NgModule({
    //...
    declarations: [bootstrapComponent],
    bootstrap: [bootstrapComponent],
    entryComponents: entryComponents
})
export class AppModule {
}
```

Идея заключается в том что все компоненты, которые участвуют в динамическом layout, т.е. могут быть на одной странице, а
на другой не быть распечатанными в DOM помещаются в entryComponents. И почти всегда нужна рутовая компонента, в которой
будут лежать базовые возможности - общие нотификации, лоадинги, попапы. Поэтому мы запускаем функцию prepareDom. Она
выполнится раньше чем bootstrap ангуляра, т.к. вызов старта ангуляра находится в main.ts `(platformBrowserDynamic()
.bootstrapModule(AppModule))`, а при импорте AppModule вызовется prepareDom(), который написан в app.module.ts перед
модулем.

```ts
function prepareDom(): void {
    if (document.querySelector('app-root') != null) {
        var rootTag = document.createElement('app-root');
        document.body.appendChild(rootTag);
    }
}
```

Теперь у нас в layout есть рутовый компонент, который запустит весь ангуляр, а остальные компоненты запустятся если будут
в html за cчет entryComponents. Также отмечу что это работает в aot режиме.

PS:
До entryComponents (т.е. в ng5) можно было поместить entryComponent в bootstrap и в функции prepareDom просканировать
layout и удалить не нужные элементы из массива bootstrap переде передачей этого массива в @NgModule. Это нужно было
сделать потомы что все элементы из bootstrap должны быть в html при запуске иначе ангуляр ругается. Также есть подвох
что там нельзя использовать преобразование мапы в массив, т.к. ангурял билдер ругается. И еще это все не работает в aot
режиме.