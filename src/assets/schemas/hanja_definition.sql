CREATE VIRTUAL TABLE `hanja_definition` USING fts3(
  `hanjas` text unique,
  `definition` text,
);
