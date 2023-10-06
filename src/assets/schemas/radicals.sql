CREATE VIRTUAL TABLE `radicals` USING fts3(
  `radical` text unique,
  `hanjas` text
);
