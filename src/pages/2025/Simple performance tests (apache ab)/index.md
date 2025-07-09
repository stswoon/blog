<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Simple performance tests (apache ab)

```blogEnginePageDate
09 июля 2025
```

Задача - нужно проверить нагрузку на сайт, бекенд. Для этого можно воспользоваться `postman runner'ом`, можно
использовать более серьезную тулу такую как `Apache JMeter` Но можно и для базовых вещей воспользоваться `apache ab`.

Подробнее документация тут - https://httpd.apache.org/docs/current/programs/ab.html

Самый большой вопрос - как скачать? Идем сюда - https://www.apachelounge.com/download/ - скачиваем
`httpd-2.4.63-250207-win64-VS17.zip` и достаем `Apache24\bin\ab.exe`. Далеее выполняем в консоле рядом с этим файлом команду

```
ab -n 100 -c 10 http://google.com/
```

обязателько в конце нужно ставить `/` без этого не дает отправить запрос.

Получаем результат

```
This is ApacheBench, Version 2.3 <$Revision: 1923142 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking google.com (be patient).....done


Server Software:        gws
Server Hostname:        google.com
Server Port:            80

Document Path:          /
Document Length:        219 bytes

Concurrency Level:      10
Time taken for tests:   8.693 seconds
Complete requests:      100
Failed requests:        0
Non-2xx responses:      100
Total transferred:      77300 bytes
HTML transferred:       21900 bytes
Requests per second:    11.50 [#/sec] (mean)
Time per request:       869.311 [ms] (mean)
Time per request:       86.931 [ms] (mean, across all concurrent requests)
Transfer rate:          8.68 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:       77   85   3.9     84      95
Processing:    92  730 134.5    765     865
Waiting:       92  522 196.6    516     791
Total:        172  815 134.4    850     947

Percentage of the requests served within a certain time (ms)
  50%    850
  66%    854
  75%    857
  80%    858
  90%    864
  95%    870
  98%    874
  99%    947
 100%    947 (longest request)
```

Рекомендую смотреть показания напротив **90%**

Более сложный пост запрос можно сделать так

```
ab -c 10 -n 100 -p request.json -T application/json -H 'Authorization: Bearer XXX' http://myserver/myapi/
```
где
* `-c` имитация клиентов - количество одновременных запросов
* `-n` количество повторений в тесте
* `-p` использовать пост вместо гет (обычно чаще стоит тестировать гет)
* `request.json` - тело пост запроса
* `-H` - добавить хедер
* `-T` - установить Content-Type







