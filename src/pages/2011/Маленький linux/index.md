<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Маленький linux

```blogEnginePageDate
10 апреля 2011
```

В этой статье показано как установить небольшой линукс, скажем на прототип робота, на примере операционной
системы [damn small linux](http://www.damnsmalllinux.org/). Его плюс в том, что он весит очень мало и его не надо
собирать.

Начнем установку.

<div style="display: flex; justify-content: center; gap: 30px;">
<iframe width="700" height="420" src="https://www.youtube.com/embed/jeTP2kZR4ms" title="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

Теперь заставим его загружаться всегда в текстовом режиме, что бы не тратить ресурсы на графику.

<div style="display: flex; justify-content: center; gap: 30px;">
<iframe width="700" height="420" src="https://www.youtube.com/embed/XoQBK7lhfR8" title="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

И наконец установим СИ, чтобы можно было программировать устройство, на котором мы поставили dsl. Для этого
предварительно нужно скачать пакеты для установки с репозитория dsl. В частности в разделе system нам понадобятся
пакеты:

* gcc1-with-libs.dsl
* libc6-dev.dsl

Установка происходит в виртуальной машине, поэтому перед установкой в видео подключается диск на котором предварительо
закачены необходимые файлы.

<div style="display: flex; justify-content: center; gap: 30px;">
<iframe width="700" height="420" src="https://www.youtube.com/embed/CYLl2AQ5l4k" title="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

Следующими шагами могут являться написание программы для работы с com-портом и настройка автоматического запуска этой
программы после запуска ОС.











