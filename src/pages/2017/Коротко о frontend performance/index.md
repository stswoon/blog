<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Коротко о frontend performance.

```blogEnginePageDate
05 июля 2017
```

Насмотрелся я как-то видео и начитался статей о performance в мире frontend и решил задокументировать кратко походы.
Подробное описание можно найти в интернете или в литературе внизу. Итак мой список пунктов связанных с performance,
которые можно использовать для улучшения\оценки производительности:

**Производительность кода**

1. Оптимизируйте код (например HashMap вместо Array)
2. Профайл для поиска узких мест
3. WebWorker для ресурсоемких операций
4. Server-side rendering
5. PWA
6. defer\async in HTML
7. Разделять чтение дома и запись, например fast-dom библиотека
8. СSS анимации выполняются на gpu в отличие от js
9. requiestAnimationFrame
10. will-transform
11. dom layout (через transfomZ(0) или will-change: transform)
12. изменение innerHtml или размера ведет к перерисовке всего документа\слоя
13. dns-prefetch, preconnect, prefetch, pretender, preload

**Производительность сборки**

1. CDN (сервер должен быть ближе к клиенту)
2. HTTP Cache Headers
3. WebP images
4. WOFF2 fonts или стандартные системные
5. Code-splittind
6. Tree-shaking
7. Core js\css load immediatelly and advanced js\css on DomContentLoaded (extra on Load)
8. Service Worker for HTTPS
9. Brotli or Zopfli compression (+20%)
10. js\css minification, lazy sourcemaps
11. image minification с потерей качества
12. icons in base64

**Производительность мозга (mind tricks)**

1. Что бы разница была заметна нужна разница в 20% времени
2. 100ms response
3. 16ms for frame
4. 1.25sec for interaction (3sec for 3G)
5. Предсказывать поведение пользователя (например при hover на search можно начать подгружать результат)
6. 14 kb for critical.css
7. как можно быстрее перевести пользователя из пассивного ожидания в активное
8. нарисовать сначала видимую часть, потом подгрузить все что ниже по скроллу или на другом state-route

**Литература**

* https://www.smashingmagazine.com/2016/12/front-end-performance-checklist-2017-pdf-pages/
* https://medium.com/reloading/javascript-start-up-performance-69200f43b201
* https://www.youtube.com/watch?v=HlKijvTa_h0
* https://www.youtube.com/watch?v=ghcfHBEe1u4
* https://www.youtube.com/watch?v=Tiv_9uweA7w
* https://www.youtube.com/watch?v=lgPs_hnIA_M
* https://www.youtube.com/watch?v=i9cOoipvST8&feature=youtu.be&list=PL8sJahqnzh8JST_ZwTcGG1FHGgKBMcpn6
* https://www.youtube.com/watch?v=7-d3O-7aus0
* https://www.sitepoint.com/check-css-animation-performance-with-the-browsers-dev-tools/