<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# NPM auto publish via gulp

```blogEnginePageDate
23 июня 2017
```

В мире JS все как-то несколько криво и не отточено в отличие от Java. Очень хорошо иллюстрирует положение вещей эту
картинка. Одна из проблем то что нельзя легко настроить публикацию npm через таску в gulp. Очень долго искал и еле нашел
всего в одном месте поэтому публикую решение здесь чтобы распространить решение и не потерять его. Исходное решение, к
сожалению исходно решение уже недоступно.

![img.png](img.png)

Зависимости
```
npm i npm --save-dev
npm i fs --save-dev
```
Примерно такие зависимости должны быть установлены
```
fs@0.0.1-security or file-system@2.2.2
npm@4.1.2
```

Код
```js
var npm = require('npm');
var fs = require('fs');

gulp.task('npm-publish', function (callback) {
    var uri = ""; //uri to npm, e.g. https://registry.npmjs.org/
    var username = ""; 
    var password = "";
    var email = ""; 
 var dist = ""; //path to dist folder with package.json

    if (!username) {
        var usernameError = new Error("Username is required as an argument --username exampleUsername");
        return callback(usernameError);
    }
    if (!password) {
        var passwordError = new Error("Password is required as an argument --password  examplepassword");
        return callback(passwordError);
    }
    if (!email) {
        var emailError = new Error("Email is required as an argument --email example@email.com");
        return callback(emailError);
    }
    npm.load(null, function (loadError) {
        if (loadError) {
            return callback(loadError);
        }
        var auth = {
            username: username,
            password: password,
            email: email,
            alwaysAuth: true
        };
        var addUserParams = {
            auth: auth
        };
        //adduser and login are the same command
        npm.registry.adduser(uri, addUserParams, function (addUserError, data, raw, res) {
            if (addUserError) {
                return callback(addUserError);
            }
            var metadata = require(dist+"/package.json");
            metadata = JSON.parse(JSON.stringify(metadata));
            npm.commands.pack([dist], function (packError) {
                if (packError) {
                    logout(addUserParams, data.token);
                    return callback(packError);
                }
                var fileName = metadata.name + '-' + metadata.version + '.tgz';
                fileName = fileName.replace("@","").replace("/","-");
                var bodyPath = require.resolve('./' + fileName);
                var body = fs.createReadStream(bodyPath);
                var publishParams = {
                    metadata: metadata,
                    access: 'public',
                    body: body,
                    auth: auth
                };
                npm.registry.publish(uri, publishParams, function (publishError, resp) {
                    if (publishError) {
                        deleteArchive(fileName);
                        logout(addUserParams, data.token);
                        return callback(publishError);
                    }
                    console.log("Publish succesfull: " + JSON.stringify(resp));
                    deleteArchive(fileName);
                    logout(addUserParams, data.token, callback);
                });
            })
        });
    });
    function logout(addUserParams, token, callback) {
        addUserParams.auth.token = token;
        npm.registry.logout(uri, addUserParams, function (logoutError, data, raw, res) {
            if (callback) {
                if (logoutError) {
                    return callback(logoutError);
                }
                return callback();
            }
        });
    }
    function deleteArchive(filePath) {
        gulp.src(filePath).pipe(plugins.rimraf());
    }
});
```