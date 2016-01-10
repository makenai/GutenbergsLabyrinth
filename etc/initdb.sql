CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title STRING NOT NULL,
  author STRING NOT NULL,
  url STRING NOT NULL UNIQUE,
  cover STRING,
  metadata TEXT
);

CREATE TABLE sentences (
  id INTEGER PRIMARY KEY,
  bookId INTEGER NOT NULL,
  blockNumber INTEGER NOT NULL,
  sentenceNumber INTEGER NOT NULL,
  sentence TEXT
);