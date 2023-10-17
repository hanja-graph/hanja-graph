CREATE TABLE `word_list` (
  `hanja` text,
  `hangul` text NOT NULL,
  `english` text NOT NULL,
  `word_type` text NOT NULL,
  PRIMARY KEY (hanja, hangul, english),
  CONSTRAINT CHK_HanjasHangulLength CHECK (LENGTH(hanja) = LENGTH(hangul) OR hanja IS NULL)
);
