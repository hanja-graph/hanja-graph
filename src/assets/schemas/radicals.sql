CREATE TABLE `radicals` (
  `radical` text UNIQUE NOT NULL,
  `hanja` text NOT NULL,
  PRIMARY KEY (radical, hanja),
  CONSTRAINT CHK_Radical CHECK (LENGTH(radical) = 1),
  CONSTRAINT CHK_Hanja CHECK (LENGTH(hanja) = 1)
);
