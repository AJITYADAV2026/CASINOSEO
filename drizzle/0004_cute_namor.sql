CREATE TABLE `site_find_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportDate` date NOT NULL,
	`sourceDigestId` int NOT NULL,
	`sourceDigestDate` date NOT NULL,
	`status` enum('completed','failed') NOT NULL DEFAULT 'completed',
	`modelId` varchar(96) NOT NULL,
	`executiveSummary` text NOT NULL,
	`decisionsJson` mediumtext NOT NULL,
	`markdownArtifact` mediumtext NOT NULL,
	`addCount` int NOT NULL DEFAULT 0,
	`updateCount` int NOT NULL DEFAULT 0,
	`retainCount` int NOT NULL DEFAULT 0,
	`archiveCount` int NOT NULL DEFAULT 0,
	`removeCount` int NOT NULL DEFAULT 0,
	`schedule_cron_task_uid` varchar(65),
	`analyzedAt` timestamp NOT NULL DEFAULT (now()),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_find_reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_find_report_date_idx` UNIQUE(`reportDate`),
	CONSTRAINT `site_find_source_digest_idx` UNIQUE(`sourceDigestId`)
);
--> statement-breakpoint
CREATE INDEX `site_find_source_date_idx` ON `site_find_reports` (`sourceDigestDate`);--> statement-breakpoint
CREATE INDEX `site_find_cron_uid_idx` ON `site_find_reports` (`schedule_cron_task_uid`);