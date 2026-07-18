<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Kafka in TestContainers

```blogEnginePageDate
20 июля 2026
```

Иногда мока одного класса недостаточно: нужно проверить микросервис целиком, а вместе с ним — реальные зависимости:
базу, Kafka, другой сервис. Один из вариантов — поднять всё через `docker-compose`. Но для тестов удобнее
[Testcontainers](https://www.testcontainers.org): библиотека поднимает одноразовые Docker-контейнеры прямо из кода
теста и удаляет их после завершения.

![img.png](img.png)

Идея простая: зависимости описываются как код, а не как отдельная инфраструктура. Нужен только Docker на машине
разработчика или в CI. Поддерживаются Java, Kotlin, Go, .NET и другие языки.

В этой заметке — минимальный пример: поднимаем Kafka в контейнере, отправляем сообщение и читаем его обратно.

## Зависимости

Понадобятся JUnit, Log4j (Testcontainers пишет в SLF4J, без биндинга в логах будут предупреждения),
`testcontainers-kafka` и `kafka-clients` для producer/consumer:

```java
dependencies {
    testImplementation 'junit:junit:4.13.2'

    testImplementation 'org.apache.logging.log4j:log4j-api:2.26.1'
    testImplementation 'org.apache.logging.log4j:log4j-core:2.26.1'
    testImplementation 'org.apache.logging.log4j:log4j-slf4j-impl:2.26.1'

    testImplementation 'org.testcontainers:testcontainers-kafka:2.0.5'
    testImplementation 'org.apache.kafka:kafka-clients:4.3.1'
}
```

## Тест целиком

Контейнер Kafka живёт внутри `try-with-resources`: после теста он останавливается автоматически. Образ
`apache/kafka-native` стартует быстрее классического JVM-образа.

```java
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.Test;
import org.rnorth.ducttape.unreliables.Unreliables;
import org.testcontainers.kafka.KafkaContainer;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.assertEquals;

public class KafkaTest {

    @Test
    public void testSimplePutAndGet() throws ExecutionException, InterruptedException {
        try (KafkaContainer kafka = new KafkaContainer("apache/kafka-native:4.0.0")) {
            kafka.start();
            String bootstrapServers = kafka.getBootstrapServers();

            KafkaProducer<String, String> producer = new KafkaProducer<>(
                    Map.of(
                            ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers,
                            ProducerConfig.CLIENT_ID_CONFIG, UUID.randomUUID().toString()
                    ),
                    new StringSerializer(),
                    new StringSerializer()
            );

            KafkaConsumer<String, String> consumer = new KafkaConsumer<>(
                    Map.of(
                            ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers,
                            ConsumerConfig.GROUP_ID_CONFIG, "tc-" + UUID.randomUUID(),
                            ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest"
                    ),
                    new StringDeserializer(),
                    new StringDeserializer()
            );

            String topicName = "messages";
            consumer.subscribe(List.of(topicName));

            producer.send(new ProducerRecord<>(topicName, "testcontainers", "rulezzz")).get();

            Unreliables.retryUntilTrue(10, TimeUnit.SECONDS, () -> {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
                if (records.isEmpty()) {
                    return false;
                }

                ConsumerRecord<String, String> record = records.iterator().next();
                assertEquals("rulezzz", record.value());
                return true;
            });

            consumer.unsubscribe();
        }
    }
}
```

## Что происходит по шагам

**1. Запуск Kafka.** `KafkaContainer` скачивает образ (при первом запуске), поднимает брокер и отдаёт
`bootstrapServers` — адрес, который нужен producer и consumer.

**2. Producer и Consumer.** Конфигурация минимальная: bootstrap-серверы, случайный `client.id` и `group.id`
(чтобы параллельные тесты не мешали друг другу), `auto.offset.reset=earliest` — читаем с начала топика.

**3. Отправка и чтение.** Подписываемся на топик `messages`, синхронно отправляем запись
(`producer.send(...).get()`), затем ждём сообщение в цикле.

**4. Ожидание с `Unreliables`.** Kafka — асинхронная система: сообщение может прийти не с первого `poll`.
`Unreliables.retryUntilTrue` из Testcontainers повторяет проверку до 10 секунд. Как только находим `"rulezzz"` —
выходим из цикла.

**5. Отписка.** `consumer.unsubscribe()` освобождает ресурсы до закрытия контейнера.

---

Исходник — [projectForLessons/test-containers-test](https://github.com/stswoon/projectForLessons/tree/master/test-containers-test).

Документация по модулю Kafka: [testcontainers.org/modules/kafka](https://www.testcontainers.org/modules/kafka/).
