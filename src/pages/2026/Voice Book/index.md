<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Voice Book

```blogEnginePageDate
13 июля 2026
```

Одно время я подсел на книжную подписку как на сериалы. Это когда автор продаёт ещё не написанную книгу, выкладывая
главу за главой каждую неделю. Очень хотелось сразу прослушать главу. Да-да, именно прослушать как аудиокнигу — времени
на чтение художественной литературы нет. А между делом, в процессе прогулки или домашних дел — пожалуйста. Или вообще
как сказку на ночь 😄. Но вот бесплатных программ для озвучивания уже нет, по крайней мере я не нашёл. А AI-движки
больно дорогие — порядка 1000 ₽ за книгу получается. Дешевле дождаться аудиокниги за 300 ₽ с хорошим чтецом. Хотя не
факт, что чтец нормальный будет; может, робо-голос даже лучше некоторых звучит. Короче, я решил создать такую программу —
и вот что получилось: https://voice-book.stswoon.ru.

![img.png](img.png)

## Бизнес-идея

Создать систему озвучивания книг, которая закроет следующие потребности:

1. возможность прослушать книгу, для которой ещё нет аудиокниги
2. возможность прослушать книгу, для которой, похоже, и не будет никогда аудиокниги
3. возможность прослушать книгу, для которой голос диктора ужасен
4. возможность прослушать книгу, которая ещё не написана до конца

## Движок

Мне удалось найти условно бесплатный TTS-движок — https://silero.ai

## Архитектура

![diagram.drawio.png](diagram.drawio.png)

### Python

* код вызова TTS — https://github.com/stswoon/voice-book/blob/main/python/silero.test.py
* зависимости для Python — https://github.com/stswoon/voice-book/blob/main/python/requirements.txt
* заранее скачанная модель — https://github.com/stswoon/voice-book/blob/main/python/tts-v3-ru-model.pt

### Frontend

* WebComponents — https://github.com/stswoon/voice-book/blob/main/client/src/app/AbstractComponent.ts
* вызов API, поллинг — https://github.com/stswoon/voice-book/blob/main/client/src/app/services/AppService.ts

### Node.js

* разбиение текста на чанки: модель не может обработать больше 1000 символов, а лучше с запасом брать
  меньше — https://github.com/stswoon/voice-book/blob/main/server/src/services/splitText.ts
* обратная транслитерация + превращение чисел в слова: модель воспринимает только русские
  буквы — https://github.com/stswoon/voice-book/blob/main/server/src/services/textTranslits.ts
* генерация тасок для паттерна TaskPool: каждая таска — отдельный spawn-процесс, чтобы вызвать Python через консоль,
  распараллелить обработку чанков текста и подписаться на сигналы из
  spawn — https://github.com/stswoon/voice-book/blob/main/server/src/services/ttsService.ts

### DevOps

Размещение Docker-контейнера происходит в системе Coolify (см. как настроить в
статье [Coolify v4](../../2026/Coolify%20v4/index.html)), которая расположена на VPS.

Сам Docker image — https://github.com/stswoon/voice-book/blob/main/Dockerfile
