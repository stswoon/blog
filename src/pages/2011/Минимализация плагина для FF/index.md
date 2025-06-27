<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Минимализация плагина для FF

```blogEnginePageDate
29 июня 2011
```

Прежде чем начать статью, хочу сослаться
на [Как создать свой плагин для Firefox](http://webdevnotice.blogspot.com/2011/06/firefox.html) - очень лаконичный пост
для начинающих писателей плагинов для FF. Однако, хоть та статья и написана очень просто, я умудрился наступить на
несколько граблей. Вот о них я и напишу, чтобы самому их помнить, да и другим помочь, если получиться.
Итак, для того чтобы разобраться в чем-то новом лучше начинать с простого, но в большинстве случаев, на мой взгляд, даже
мануалы типа Getting started имеют множество лишних элементов. Так и с Add-on Developer Hub из указанной выше статьи.
Даже в самом простом плагине мы получаем аж 9 файлов (>100 cтрок кода) - согласитесь это никак не подходит для программы
типа Hello world.

Уменьшим количество кода как можно больше, но так, что бы мы могли вывести заветную мантру "Hello World!!!". Для этого
оставим такую структуру файлов:

```
./chrome
    /content
      ff-overlay.xul
      overlay.js
chrome.manifest
install.rdf
```

Уберем лишний код и оставим только нужное.

```
/install.rdf

email@mail.ru
2
Google Blogger expand posting form width
0.1
stswoon

Google Blogger expand width of form of creating new post

    {ec8030f7-c20a-464f-9b0e-13a3a9e97384} 
    4.0
    8.0
```

**Грабля 1**. Обратите внимание на `<em:minVersion>` и `<em:maxVersion>`. В процессе создания шаблона плагина
через [Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/tools/builder) можно ненароком указать версии
наоборот (FF8-FF4 вместо FF4-FF8), из-за чего плагин не будет загружаться в FF с локального компьютера и может не
сказать почему он не загружается.

```
/chrome.manifest

content   gbepfw                 chrome/content/

overlay   chrome://browser/content/browser.xul   chrome://gbepfw/content/ff-overlay.xul
```

Здесь указываем ссылку на файл ff-overlay.xul. От папок избавиться нельзя.

```
/chrome/content/ff-overlay.xul

<script src="overlay.js"/>
```

Здесь указываем ссылку на файл overlay.js

```js
// /chrome/content/overlay.js
var gbepfw = {
    onLoad: function () {
        alert("Hello World!!!");
    }
};

window.addEventListener("load", function () {
    gbepfw.onLoad();
}, false);
```

Этот файл показывает сообщение при загрузке FF.

**Грабля 2**. При генерировании шаблона создаются два файла ff-overlay.js и overlay.js, обратите внимание, что для Hello
World нужно оставить именно overlay.js.

Итак мы получили всего 4 файла и меньше чем 25 строк кода. Я думаю, здесь сложнее запутаться. Теперь засовываем эту
иерархию файлов в zip-архив и открываем в FF для проверки. Если собираетесь выкладывать плагин в сеть, то предварительно
поменяйте расширение архива на xpi.

**Грабля 3**. Формируйте архив без сжатия.

PS: пока писал пост, наткнулся на очень интересную тему подсветки кода в Blogger. Мне очень
помогла [эта статья](http://heisencoder.net/2009/01/adding-syntax-highlighting-to-blogger.html).


