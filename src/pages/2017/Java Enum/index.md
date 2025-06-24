<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Java Enum

```blogEnginePageDate
07 августа 2017
```

Периодически забываю как делать сложные enum с поиском по строке (метод valueOfPretty), поэтому вот заготовка.

```java
public enum EnumExample {
    ZERO(0, "zero value"),
    ONE(1, "one value"),
    NULL(-1, "null value") {
        @Override
        public String toString() {
            return super.toString() + "special null value";
        }
    };

    private int value;
    private String description;

    EnumExample(int value, String description) {
        this.value = value;
        this.description = description;
    }

    public String asPretty() {
        return this.name().toLowerCase();
    }

    public static EnumExample valueOfPretty(String s) {
        for (EnumExample state : EnumExample.values()) {
            if (state.asPretty().equals(s)) {
                return state;
            }
        }
        return null;
    }
}
```