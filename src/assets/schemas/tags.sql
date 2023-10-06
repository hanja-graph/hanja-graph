CREATE TABLE tags(
  hanja TEXT,
  hangul TEXT NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (hanja) REFERENCES hanjas(hanja),
  FOREIGN KEY (hangul) REFERENCES hanjas(hangul)
);
