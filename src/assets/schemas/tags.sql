CREATE TABLE tags(
  hanja TEXT NOT NULL,
  hangul TEXT NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (hanja) REFERENCES word_list(hanja),
  FOREIGN KEY (hangul) REFERENCES word_list(hangul),
  CONSTRAINT UC_HanjaHangul UNIQUE (hanja,hangul)
);
