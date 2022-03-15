FROM php:8.0-apache
RUN apt-get update \
    && apt-get install -y libpq-dev
RUN apt-get install -y less vim git expect

RUN cp /usr/local/etc/php/php.ini-development /usr/local/etc/php/php.ini
RUN sed -i -e 's/memory\_limit \= 128M/memory\_limit \= 1024M/' \
    -i -e 's/\;date\.timezone \=/date\.timezone \= \"Asia\/Tokyo\"/' \
    -i -e "s/\;extension\_dir \= \'ext\'/extension\_dir \= \'ext\'/" \
    /usr/local/etc/php/php.ini
RUN sed -i -e 's/\;zend_extension\=opcache/zend_extension\=opcache/' \
    -i -e 's/\;opcache.enable\=1/opcache.enable\=1/' \
    -i -e 's/\;opcache.enable_cli\=0/opcache.enable_cli\=1/' \
    -i -e 's/\;opcache.optimization_level\=0x7FFFBFFF/opcache.optimization_level\=0x7FFFBFFF/' \
    -i -e 's/\;opcache.lockfile_path\=\/tmp/\;opcache.lockfile_path\=\/tmp\n\nopcache\.jit\_buffer\_size \= 128M/' \
    /usr/local/etc/php/php.ini

RUN mkdir ssl
COPY openssl.exp ssl/
WORKDIR /var/www/html/ssl
RUN openssl genrsa 2048 > server.key
RUN expect openssl.exp
RUN ls -la
RUN openssl x509 -days 36500 -req -signkey server.key < server.csr > server.crt
WORKDIR /var/www/html
RUN cp ssl/server.crt /etc/ssl/certs/
RUN cp ssl/server.key /etc/ssl/private/
RUN sed -i -e 's/\/etc\/ssl\/certs\/ssl\-cert\-snakeoil\.pem/\/etc\/ssl\/certs\/server\.crt/' \
    -i -e 's/\/etc\/ssl\/private\/ssl\-cert\-snakeoil\.key/\/etc\/ssl\/private\/server\.key/' \
    /etc/apache2/sites-available/default-ssl.conf
RUN a2enmod ssl \
    && a2ensite default-ssl.conf

RUN curl -s http://getcomposer.org/installer | php && \
    mv composer.phar /usr/local/bin/composer
