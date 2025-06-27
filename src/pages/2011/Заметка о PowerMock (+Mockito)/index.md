<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Заметка о PowerMock (+Mockito)

```blogEnginePageDate
17 ноября 2011
```

Статья SuppressUnwantedBehavior покрывает большинство основных вопросов (также советую статью про замену методов
класса). Несколько моментов, которые я хотел бы подчеркнуть:

**PrepareForTest**

В эту аннотацию нужно вписать все классы, в которых используется PowerMock.

```
@PrepareForTest(MyClass.class)
```

**SuppressStaticInitializationFor**

Эта аннотация поможет, когда нужно создать класс без статической инициализации.

```
@SuppressStaticInitializationFor("path.to.class.ClassWithStaticParameter")
class ClassWithStaticParameter() {
    private static final Log log = LogFactory.getLog(ClassWithStaticParameter.class);
}
```

**Замена статичных методов**

```
replace(method(OldClass.class, "callOldMethod"))
    .with(method(NewClass.class, "callNewMethod"));
```

**Указание сигнатуры метода**

Если есть несколько методов с одинаковым названием, то, например для подавления метода, нужно указывать сигнатуру.

```
suppress(method(MyClass.class, "callMethod",String .class /*сигнатура*/));
```

**Mockito.CALLS_REAL_METHODS**

Позволяет использовать переопределенные методы в абстрактных классах. В следующем примере при отсутствии
Mockito.CALLS_REAL_METHODS вместо getAttribute() из FakeHttpSession был бы вызван метод HttpSession.getAttribute().

```
HttpSession fakeHttpSession = mock(FakeHttpSession.class, Mockito.CALLS_REAL_METHODS);
fakeHttpSession.getAttribute("attr");

abstract class FakeHttpSession implements HttpSession {
    private HashMap attrs;

    public Object getAttribute(String s) {
        if (attrs == null) attrs = new HashMap();
        return attrs.get(s);
    }

    public void setAttribute(String s, Object o) {
        if (attrs == null) attrs = new HashMap();
        attrs.put(s, (String) o);
    }
}
```




