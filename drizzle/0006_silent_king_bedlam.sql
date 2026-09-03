ALTER TABLE `site_find_reports` DROP INDEX `site_find_source_digest_idx`;--> statement-breakpoint
CREATE INDEX `site_find_source_digest_idx` ON `site_find_reports` (`sourceDigestId`);