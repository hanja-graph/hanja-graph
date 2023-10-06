CREATE TABLE `hanjas` (
  `hanja` text,
  `hangul` text NOT NULL,
  `english` text NOT NULL,
  PRIMARY KEY (hanja, hangul),
  CONSTRAINT CHK_Hanjas CHECK (LENGTH(hanja) = LENGTH(hangul))
);
