
CREATE TABLE `korean_pronunciation` (
  `hanja` text NOT NULL,
  `hangul` text  NOT NULL,
  PRIMARY KEY (hanja, hangul),
  CONSTRAINT CHK_Hanja CHECK (LENGTH(hanja) = 1),
  CONSTRAINT CHK_Hangul CHECK (LENGTH(hangul) = 1)
);
