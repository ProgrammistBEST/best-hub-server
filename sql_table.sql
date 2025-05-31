CREATE TABLE brands (
  brand_id INT NOT NULL AUTO_INCREMENT,
  brand VARCHAR(64),
  PRIMARY KEY (brand_id),
  UNIQUE (brand)
);

CREATE TABLE platforms (
  platform_id INT NOT NULL AUTO_INCREMENT,
  platform VARCHAR(64),
  PRIMARY KEY (platform_id),
  UNIQUE (platform)
);

CREATE TABLE articles (
  article_id INT NOT NULL AUTO_INCREMENT,
  article VARCHAR(64),
  PRIMARY KEY (article_id),
  UNIQUE (article)
);

CREATE TABLE external_articles (
  external_article_id INT NOT NULL AUTO_INCREMENT,
  article_id INT NOT NULL,
  external_article VARCHAR(64),
  platform_id INT NOT NULL,
  PRIMARY KEY (external_article_id),
  FOREIGN KEY (article_id) REFERENCES articles (article_id) ON DELETE CASCADE,
  FOREIGN KEY (platform_id) REFERENCES platforms (platform_id) ON DELETE CASCADE,
  UNIQUE (platform_id, external_article) -- Составной уникальный индекс
);

CREATE TABLE sizes (
  size_id INT NOT NULL AUTO_INCREMENT,
  size VARCHAR(10),
  PRIMARY KEY (size_id),
  UNIQUE (size)
);

CREATE TABLE models (
  model_id INT NOT NULL AUTO_INCREMENT,
  brand_id INT NOT NULL,
  platform_id INT NOT NULL,
  article_id INT NOT NULL,
  size_id INT NOT NULL,
  sku VARCHAR(32),
  pair SMALLINT DEFAULT 20,
  category VARCHAR(64),
  gender VARCHAR(64),
  color VARCHAR(64),
  compound VARCHAR(100),
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (model_id),
  UNIQUE (sku),
  FOREIGN KEY (brand_id) REFERENCES brands (brand_id) ON DELETE CASCADE,
  FOREIGN KEY (platform_id) REFERENCES platforms (platform_id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles (article_id) ON DELETE CASCADE,
  FOREIGN KEY (size_id) REFERENCES sizes (size_id) ON DELETE CASCADE
);

-- Таблица категорий
create table api_categories (
    api_category_id int auto_increment primary key,
    category varchar(100) not null unique
);

-- Таблица токенов
create table apis (
    api_id int auto_increment primary key,
    token text not null, -- Хэшированный токен
    brand_id int not null,
    platform_id int not null,
    api_category_id int not null, -- Ссылка на категорию
    created_at timestamp default current_timestamp, -- Время создания записи
    expiration_date timestamp, -- Срок действия токена
    foreign key (brand_id) references brands(brand_id) on delete cascade,
    foreign key (platform_id) references platforms(platform_id) on delete cascade,
    foreign key (api_category_id) references api_categories(api_category_id) on delete cascade,
    constraint chk_expiration_date check (expiration_date > created_at)
);