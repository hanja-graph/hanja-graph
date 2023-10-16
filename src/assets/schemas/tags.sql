CREATE TABLE tags(
  hanja TEXT,
  hangul TEXT NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (hanja) REFERENCES word_list(hanja),
  FOREIGN KEY (hangul) REFERENCES word_list(hangul)
);
