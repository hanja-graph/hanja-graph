CREATE TABLE `korean_hanja_definition` (
  `hanja` text NOT NULL,
  `definition` text NOT NULL,
  PRIMARY KEY (hanja, definition),
  CONSTRAINT CHK_Hanja CHECK (LENGTH(hanja) = 1)
);
