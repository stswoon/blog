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

Для кейса когда нужно не просто замокировать класс, а сделать это для всего микросервиса, а еще и чтобы его депенды -
база, кафка, другой сервис были максимально настоящими есть вариант поднять сервис и его депенды в докере, например
через docker-compose. Но есть решение еще лучше TestContainers.

TestContainers (https://www.testcontainers.org) позволяет Unit tests with real dependencies
Testcontainers is an open source library for providing throwaway, lightweight instances of databases, message brokers,
web browsers, or just about anything that can run in a Docker container.
How it works
Test dependencies as code
No more need for mocks or complicated environment configurations. Define your test dependencies as code, then simply run
your tests and containers will be created and then deleted.
With support for many languages and testing frameworks, all you need is Docker.

Давайте попробуем поднять Kafka в TestContainers.

1) Укажем депенды - junit, логгер, kafka-clients (для подписки на топик) и testcontainers-kafka (движок кафки,
   упакованный в докер и обязанный testcontainers утилитками)

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

2) Создадим тест

```java
public class KafkaTest {
    @Test
    public void testSimplePutAndGet() throws ExecutionException, InterruptedException {
        //...
    }
}
```

3) Запустим Кафку

```
import org.testcontainers.kafka.KafkaContainer;
//...
try (KafkaContainer kafka = new KafkaContainer("apache/kafka-native:4.0.0")) {
        kafka.start();
        String bootstrapServers = kafka.getBootstrapServers();
        //..
}
```

4) Создадим Producer и Consumer

```java
KafkaProducer<String, String> producer = new KafkaProducer<>(
        Map.of(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers,
                ProducerConfig.CLIENT_ID_CONFIG, UUID.randomUUID().toString()
        ),
        new StringSerializer(),
        new StringSerializer()
);
```

```java
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(
        Map.of(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers,
                ConsumerConfig.GROUP_ID_CONFIG, "tc-" + UUID.randomUUID(),
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest"
        ),
        new StringDeserializer(),
        new StringDeserializer()
);
```

5) Подпишемся на топик

```
String topicName = "messages";
consumer.subscribe(List.of(topicName));
```

6) Отправим Event

```
producer.send(new ProducerRecord<>(topicName, "testcontainers", "rulezzz")).get();
```

7) Начнем полить ивенты из кафки и сверять нашли ли отправленный `rulezzz`. Т.к. мы знаем что он будет только 1 то после
   получения ивента возвращает true и выходим из цикла.

```
Unreliables.retryUntilTrue(10, TimeUnit.SECONDS, () -> {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    if (records.isEmpty()) {
        return false;
    }

    ConsumerRecord<String, String> record = records.iterator().next();
    assertEquals("rulezzz", record.value());
    return true;
});
```

8) Не забываем отписаться

```
consumer.unsubscribe();
```

---

Исходник - https://github.com/stswoon/projectForLessons/tree/master/test-containers-test