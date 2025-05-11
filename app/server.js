const express = require('express'); // Подключение библиоткеи Express
const app = express(); // Создание экземпляра приложения
const redis = require('redis'); // Подключение блиоткеи Redis
const redisClient = redis.createClient({ // Настройка клиента Redis
   legacyMode: true, // Режим совместимости, необходим для нормальной работы в Docker контейнере
   socket: { // Параметры подключения
      host: 'redis', // Имя сервиса
      port: 6379 // Порт, стандартный для Redis
   }
});
const allowedPaths = ['/'] // Список разрешенных URL-путей

// Функция нормализации пути
function normalize_path(path) {
   if (path === '/') return '/'; // Если главная страница, то оставить
   return path.split('?')[0].replace(/\/$/, ''); // Удаление знака / с конца ссылки и параметров
}

redisClient.connect(); // Установка соединения с Redis

app.set('view engine', 'ejs'); // Использование EJS как шаблонизатора
app.set('views', __dirname + '/views'); // Указание папки с шаблонами EJS

app.use(express.static('public')); // Раздача статических файлов из папки public
app.use(express.urlencoded({ extended: true })); // Парсер данных из HTML-форм

// Проверка разрешенности пути для GET-запросов
app.use((req, res, next) => {
   // Проверка на метод GET и проверки на отсуствие адреса в списке разрешенных путей
   if (req.method === 'GET' && !allowedPaths.includes(normalize_path(req.path))) {
      return res.status(302).redirect('/'); // Возврать со статусом 302 на главную страницу
   }
   next(); // Продолжить обработку, если все нормально
});

// Обработчик GET-запроса на главную страницу
app.get('/', async(req, res) => {
   try { // Попытка выполнить код внутри
      // Получить список сообщений из базы данных
      const messages = await redisClient.lRange('messages', 0, -1);
      res.render('index', { messages }); // Отобразить шаблон index.ejs с данными
   } catch (err) { // Обработка в случае ошибки при выполнении try
      res.status(500).send('Ошибка сервера ' + err); // Ошибка при работе с Reids
   }
});

// Обработчки POST-запроса для добавления сообщения
app.post('/add', async(req, res) => {
   // Получение текста из формы без пробелов в начале и конце
   const message = req.body.message.trim();
   if (!message) return res.status(300).send('Пустое сообщение'); // Проверка на пустоту
   try { // Попытка выполнить код внутри
      // Сохранение сообщения в начало массива
      await redisClient.lPush('messages', message);
      res.redirect('/'); // Возвращение на главную старницу
   } catch (err) { // Обработка в случае ошибки при выполнении try
      res.status(500).send('Ошибка сохранения сообщения'); // Ошибка при сохранении
   }
});

// Запуск сервера на порту 5000
app.listen(5000, function(err) {
   if (err) console.log("Ошибка в настройках сервера")
});
