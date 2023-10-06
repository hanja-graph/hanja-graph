
CREATE VIRTUAL TABLE `korean_pronunciation` USING fts3(
  `hanjas` text,
  `hangul` text unique
);
