FROM ruby:2.2.5

MAINTAINER EntropyRy <webmaster@entropy.fi>

ENV INSTALL_PATH /srv/rails/nakkikone

ENV RAILS_ENV production

RUN apt-get update && apt-get install -qq -y --fix-missing --no-install-recommends \
    build-essential nodejs-legacy libpq-dev mysql-client

RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH

COPY Gemfile Gemfile

RUN bundle install

COPY . .

RUN bundle exec rake assets:precompile
