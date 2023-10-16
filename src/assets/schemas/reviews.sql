CREATE TABLE reviews(
  hanja TEXT,
  hangul TEXT NOT NULL,
  interval REAL NOT NULL,
  easiness_factor REAL NOT NULL,
  last_reviewed DATETIME,
  FOREIGN KEY (hanja) REFERENCES word_list(hanja),
  FOREIGN KEY (hangul) REFERENCES word_list(hangul),
  PRIMARY KEY (hanja, hangul)
);
