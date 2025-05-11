# Использование последней версии nginx как базового образа
FROM nginx

# Запуск команды на удаление конфига сервера
RUN rm /etc/nginx/conf.d/default.conf

# Копирование собственного конфига взамен удаленного
COPY nginx.conf /etc/nginx/conf.d/default.conf
