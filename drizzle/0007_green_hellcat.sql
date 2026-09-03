CREATE TABLE `url_manifests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`manifestDate` date NOT NULL,
	`sourceSiteFindId` int NOT NULL,
	`sourceSiteFindUpdatedAt` timestamp NOT NULL,
	`sourceReportDate` date NOT NULL,
	`status` enum('completed','partial','failed') NOT NULL DEFAULT 'completed',
	`actionsJson` mediumtext NOT NULL,
	`markdownArtifact` mediumtext NOT NULL,
	`createdCount` int NOT NULL DEFAULT 0,
	`updatedCount` int NOT NULL DEFAULT 0,
	`retainedCount` int NOT NULL DEFAULT 0,
	`archivedCount` int NOT NULL DEFAULT 0,
	`reviewCount` int NOT NULL DEFAULT 0,
	`schedule_cron_task_uid` varchar(65),
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `url_manifests_id` PRIMARY KEY(`id`),
	CONSTRAINT `url_manifest_date_idx` UNIQUE(`manifestDate`)
);
--> statement-breakpoint
CREATE INDEX `url_manifest_source_report_idx` ON `url_manifests` (`sourceSiteFindId`);--> statement-breakpoint
CREATE INDEX `url_manifest_source_date_idx` ON `url_manifests` (`sourceReportDate`);--> statement-breakpoint
CREATE INDEX `url_manifest_cron_uid_idx` ON `url_manifests` (`schedule_cron_task_uid`);