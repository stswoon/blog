<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Компонента Angular \ Angular2

```blogEnginePageDate
25 октября 2017
```

Данная статься скорее для себя, здесь не будет ничего нового чего бы вы не смогли найти в интернете. Я заметил что когда
пишу новую компоненту мне легче начинать с какого-то шаблона. В качестве шаблона я выбрал компоненту - текстовое поле с
иконкой поиска и вызовом callback, которую писал сам.

#### AngularJs

```html
//fastSearch.tmpl.html
<div class="fast-search">
    <input type="text"
           class="fast-search__input"
           placeholder="{{fastSearchCtrl.hint}}"
           ng-model="fastSearchCtrl.value"
           ng-keydown="fastSearchCtrl.cancelSearch()"
           ng-keyup="fastSearchCtrl.search()"
    >
    </input>
    <div class="fast-search__icon"></div>
</div>
```

```js
//fastSearchComponent.js
/**
 *  Creates FastSearchComponent.
 *  Main parameter is:
 *  - callback - it will be executed after user input.
 *  Also it contains secondary parameters:
 *  - min-letters-count - callback will be called only if input text length >= min-letters-count (0 by default)
 *  - delay - number of ms to wait after user finish input (500ms by default)
 *  - hint - text to be shown af hint ("" by default)
 *
 *  Use it like:
 *  <code><pre>
 *  &lt;div ng-controller="testFastSearchController">
 *      &lt;fast-search search-callback="doSearch(value);">&lt;/fast-search>
 *  &lt;/div>
 *  </pre></code>
 *  where doSearch is a function of testFastSearchController so controller
 *  may looks like:
 *  <code><pre>
 *  function testFastSearchController($scope) {
 *      $scope.doSearch = function (value) {
 *          alert("doSearch: value=" + value);
 *      };
 *  };
 *  </pre></code>
 *  Another example with secondary params:
 *  <code><pre>
 *  &lt;fast-search search-callback="doSearch(value);"
 *                      min-letters-count="3"
 *                      delay="500"
 *                      hint="Type to search"
 *  >&lt;/fast-search>
 *  </pre></code>
 */
function fastSearchComponent() {
    return {
        templateUrl: "ui-components/fastSearch/fastSearch.tmpl.html",
        controllerAs: "fastSearchCtrl",
        bindings: {
            searchCallback: "&",
            minLettersCount: '@',
            delay: '@',
            hint: '@'
        },
        controller: function ($timeout) {
            this.hint = this.hint || "";
            this.minLettersCount = this.minLettersCount || 0;
            this.delay = this.delay || 500;

            this.value = "";

            var timerId = null;
            var oldValue = null;

            var self = this;
            self.search = function () {
                if (debug) console.log(self.value);
                if (debug) console.log(self.minLettersCount);

                if (self.value.length >= self.minLettersCount && self.value != oldValue) {
                    $timeout.cancel(timerId);
                    timerId = $timeout(function () {
                        self.searchCallback({value: self.value});
                        $timeout.cancel(timerId);
                    }, self.delay);
                }

                oldValue = self.value;
            };
            self.cancelSearch = function () {
                $timeout.cancel(timerId);
            };
        },
    };
};
```

```less
//fastSearch.less
/**
 * Show magnifier icon as circle.
 * On hover input appears slowly increasing width to the right.
 * Input has round left and right. Magnifier is above input.
 * On un hover (of icon and input input) input slowly decrease width and hides.
 * If input has focus than it is not hides without hover.
 * Input should be over other element which can be laying under it after increasing.
 */
.fast-search {
  display: flex;
  overflow: hidden;
  margin: 20px -20px;
  padding-bottom: 30px;
  padding-left: 20px;
  padding-right: 20px;
  white-space: nowrap;
  height: 40px;
  width: 80px;

  &:hover {
    width: 400px;
    transition: width 1s;
  }

  &:not(:hover) {
    transition: width 1s;
  }

  &:hover &__input {
    width: inherit;
    z-index: 1000;
  }

  &:not(:hover) &__input {
    transition: width 1s, z-index 0s 1s;
    animation: fast-search__z-index-animation 3s cubic-bezier(1, 0, 1, 0) //wa
  }

  &:not(:hover) &__icon {
    animation: fast-search__z-index-animation 3s cubic-bezier(1, 0, 1, 0) //wa
  }

  &:hover &__icon {
    z-index: 1001;
  }

  &__input {
    border-radius: 20px;
    height: 40px;
    width: 0px;
    padding-left: 40px;
    left: 0px;
    position: absolute;
    border: 1px solid #edf0f3
  }

  &__input:focus {
    width: 400px !important;
    z-index: 1000;
  }

  &__input:focus + &__icon {
    z-index: 1001;
  }

  &__icon {
    .icon_fast-search;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-position: 13px;
    background-size: 15px 15px;
    background-color: #b5cbd1;
    z-index: 1;
  }
}

@keyframes fast-search__z-index-animation {
  from {
    z-index: 1000;
  }
  to {
    z-index: 0;
  }
}

.icon_fast-search() {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAMAAAAMCGV4AAAATlBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////+QlxstAAAAGXRSTlMA5CT4YEIX+cO3pwPP39vZmIl8dFpXNiIGZA///QAAAHpJREFUCNdVjFcOwzAMQ2XL286evP9FqyguivKDBB8kElF1iWHmi16FBBXvWmtCXE57NMA/3SFq3hljlUxY+h/rAePsQxmbOGB7L1jFDY7eJzjxGe2mPhwkLkYOWlGU7wDnMgEw75IfIYrFfEH12+oCWQU/PWCgPzC0D353BsTzDxftAAAAAElFTkSuQmCC");
  background-repeat: no-repeat;
}
```

```html
//testFastSearchController.tmpl.html
<div ng-controller="testFastSearchController">
    <fast-search search-callback="doSearch(value);"
                 min-letters-count="3"
                 delay="500"
                 hint="Type to search"
    ></fast-search>
</div>
//testFastSearchController.tmpl.html
function testFastSearchController($scope) {
$scope.doSearch = function (value) {
alert("doSearch: value=" + value);
};
};
```

#### Angular2

```html
//ux-search-input.component.html
<div [ngClass]="calculateClasses()"
     *ngIf="!hidden"
>
    <ux-textbox class="ux-search-input__input"
                [placeholder]="placeholder"
                [disabled]="disabled"
                [defaultValue]="defaultValue"
                (valueChange)="handleChange($event)"
                (keyup)="handleKeyUp($event)"
    ></ux-textbox>
</div>
```

```ts
//ux-search-input.component.ts
import {Component, Input, Output, ElementRef, EventEmitter, OnInit} from "@angular/core";

@Component({
    selector: "ux-search-input",
    templateUrl: "ux-search-input.component.html"
})
export class UxSearchInputComponent implements OnInit {
    @Input() protected wide: boolean = false;
    @Input() protected searchMinSymbols: number = 0;
    @Input() protected searchDelay: number = 500;
    @Input() protected hidden: boolean = false;
    @Input() protected disabled: boolean = false;
    @Input() protected placeholder: string = "";
    @Input() protected styleClass: string = "";
    @Input() protected defaultValue: string = "";

    private readonly debug: boolean;

    public constructor(elementRef: ElementRef) {
        this.debug = false;
    }

    public ngOnInit(): void {
        if (this.debug) {
            const properties = {
                wide: this.wide,
                searchMinSymbols: this.searchMinSymbols,
                searchDelay: this.searchDelay,
                hidden: this.hidden,
                disabled: this.disabled,
                placeholder: this.placeholder,
                styleClass: this.styleClass,
                defaultValue: this.defaultValue
            };
            console.log("UxSearchInputComponent#ngOnInit: ", properties);
        }

        this.value = this.defaultValue;
    }

    private timerId: any;
    private value: string = "";
    private oldValue: string = "";
    @Output() protected searchCallback = new EventEmitter();

    protected handleChange(value: string): void {
        this.value = value;

        if (this.debug) {
            const params = {value: this.value, oldValue: this.oldValue, searchMinSymbols: this.searchMinSymbols};
            console.log("UxSearchInputComponent#handleChange: ", params);
        }

        if (this.value.length >= this.searchMinSymbols && this.value != this.oldValue) {
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                this.searchCallback.emit(this.value);
                clearTimeout(this.timerId);
            }, this.searchDelay);
        }

        this.oldValue = this.value;
    }

    private readonly ENTER_KEY_CODE: number = 13;

    /**
     * Watch for Enter value to call searchCallback without wating for searchDelay or minimal letters.
     * @param keyboardEvent
     */
    protected handleKeyUp(keyboardEvent: any): void {
        if (this.debug) console.log("UxSearchInputComponent#handleKeyUp: ", keyboardEvent);
        if (keyboardEvent.keyCode === this.ENTER_KEY_CODE) {
            this.searchCallback.emit(this.value);
        }
    }

    /**
     * Calculate classes for component
     * @returns
     * search-input, [search-input__wide], [styleClass]
     * where [styleClass] will convert to string value from parameter customClass
     * or to none if styleClass is empty or null,
     * search-input__wide will be added only if wide==true
     */
    //http://stackoverflow.com/questions/34518235/multiple-classes-in-ngclass
    protected calculateClasses(): any {
        var ngClass = {
            'ux-search-input': true,
            'ux-search-input__wide': this.wide,
        };
        ngClass[this.styleClass] = this.styleClass;
        return ngClass;
    }
}
```

```ts
//ux-search-input.module.ts
import {NgModule} from "@angular/core";
import {UxSearchInputComponent} from "./ux-search-input.component";

@NgModule({
    exports: [UxSearchInputComponent],
    declarations: [UxSearchInputComponent]
})
export class UxSearchInputModule {
}
```

```less
//ux-search-input.less

/**
 * Show magnifier icon as rectangle.
 * Show rectangle input on the right from magnifier.
 * Can be wide - fill all space by horizontal
 */
.ux-search-input {
  display: inline-block;
  padding: 2px;

  &__input {
    height: 45px;
    padding: 16px 0px 14px 45px;
    width: 100%;
    border: 1px solid #e1e1e1;
    .icon_search_big;
    background-color: #fff;
    background-position: 10px 11px;
    letter-spacing: 0.06em;
    .font-light;
  }

  .icon_search_big() {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAMAAAC6CgRnAAAAaVBMVEUAAABOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaFOeaH///9OeaHt8fVWf6WMqMLy9fjQ2+amvNCctMuZssnv8/fT3ujT3eeNqcPCXzTyAAAAFXRSTlMAl9YH8NBMm7ZFRPbq2sVuUTcjE9+rz+RgAAAAv0lEQVQoz4WS1xKCMBQFU0Cw12yQrv//kWKkZsywrztnbhU9OxlHRLHcCZ+NYkBtFkZL5iR6plIgq165ydsqA9JJJsDTmh/2+U2OtYDSTJTAUFN1KTOnS6q+eciahbMZbJ2TUJslNUjnYig8V0DsXATWcxYi5wDjA6zlwvXCfQbma9x84b2s79O/wxt4aO9+7XC/jtN9lAlzFHC8Bf7lDByuYmTb/5lr/rKH/UX853oAzgF5O4IUAe6nVATRWnwAzC8kQg7xV5wAAAAASUVORK5CYII=");
    background-repeat: no-repeat;
  }
}

.ux-search-input__wide {
  display: inline;

  .ux-search-input__input {
    height: 51px;
    padding: 0px 0px 0px 45px;
    display: inline-block;
  }

  .ux-search-input__input .ux-textbox {
    width: 100%;
  }
}
```

```html
//test-ux-search-input.component.html
<ux-search-input (searchCallback)="handleSearch($event)"
                 defaultValue="Erase text for hint"
                 placeholder="3 symbols or enter"
                 [searchMinSymbols]="3"
></ux-search-input>
```

```ts
//test-ux-search-input.component.ts
import {Component} from "@angular/core";
import {UxSearchInputComponent} from "../../../ux-search-input.component";

@Component({
    selector: "test-ux-search-input-parent",
    templateUrl: "test-ux-search-input.component.html"
})
export class TestUxSearchInput {
    handleSearch(value: string): void {
        console.log("handleSearch: value=" + value);
    }
}
```

### Стили

Отмечу что в 1 и 2 ангуляре сложные стили лучше помещать в функцию. Сложные стили это:

1) если ты используешь {{}} в class и потом еще ng-class используешь
2) если у тебя ключи объекта в ng-class генерируются
   Это проявляется тем, что стили не применяются а в консоли иногда видно сообщение "Multiple definitions of a property
   not
   allowed in strict mode"

#### Ангуляр2

```html

<div [ngClass]="calculateClasses()" *ngIf="!hidden"></div>
```

```ts
//http://stackoverflow.com/questions/34518235/multiple-classes-in-ngclass
class SomeComponent {
    protected calculateClasses(): any {
        var ngClass = {
            'ux-search-input': true,
            'ux-search-input__wide': this.wide,
        };
        ngClass[this.styleClass] = this.styleClass;
        return ngClass;
    }
}
```

#### АнгулярJs

```js
/* This function simulate
 * ng-class="{
 *   'my-button_{{$ctrl.color}}': $ctrl.color,
 *   'my-button_{{$ctrl.size}}': $ctrl.size,
 *   '{{$ctrl.customClass}}': $ctrl.customClass
 * }"
 */
// https://stackoverflow.com/questions/18172573/angular-ng-class-if-else-expression
this.getClasses = function () {
    var classes = [];
    if (self.color) {
        classes.push("my-button_" + self.color);
    }
    if (self.size) {
        classes.push("my-button_" + self.size);
    }
    if (self.customClass) {
        classes.push(self.customClass);
    }
    return classes.join(" ");
}
```

### PS

Online syntax highlighting - https://tohtml.com/jScript/