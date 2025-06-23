<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Пример стандартного проксирования в nginx

```blogEnginePageDate
18 октября 2019
```

К сожалению я уже не помни всю литературу, которую я пролазил в интернете, но довольно многие отмечали что чтобы
получить такой простой код нужно потратить много крови, если ты не специализируешься на nginx. Поэтому оставлю код
здесь, чтобы в следующий раз не искать.

```nginx configuration
#/gateway/otherPach --->  /otherPach
location ~ ^/gateway/(.*).(js|css|jpg|jpeg|gif|png|ico|svg|svgz|eot|otf|woff|woff2|ttf)$ {
    include envvars.conf;
    
    set $protocol "http";
    if ($http_x_forwarded_proto = "https") {
        set $protocol "https";
    }    
    #$1 - otherPach
    #$2 - расширения
    #$gateway - переменная из envvars.conf
    proxy_pass $protocol://$gateway/$1.$2;
    proxy_redirect off;

    #для security советуют убирать
    proxy_hide_header Set-Cookie;

    #заменяем и ставим свои хедеры для кешей
    proxy_hide_header Pragma;
    proxy_hide_header Cache-Control;
    expires 365d;
    add_header Cache-Control public;
}
```
