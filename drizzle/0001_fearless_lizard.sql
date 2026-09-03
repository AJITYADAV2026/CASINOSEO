CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`accent` varchar(16) NOT NULL DEFAULT '#C9A45C',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `daily_digests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`digestDate` date NOT NULL,
	`slug` varchar(180) NOT NULL,
	`title` varchar(280) NOT NULL,
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`status` enum('developing','published','archived') NOT NULL DEFAULT 'developing',
	`schedule_cron_task_uid` varchar(65),
	`publishedAt` timestamp,
	`modifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_digests_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_digests_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `daily_digests_date_idx` UNIQUE(`digestDate`),
	CONSTRAINT `daily_digests_cron_uid_idx` UNIQUE(`schedule_cron_task_uid`)
);
--> statement-breakpoint
CREATE TABLE `digest_stories` (
	`digestId` int NOT NULL,
	`storyId` int NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	CONSTRAINT `digest_stories_digestId_storyId_pk` PRIMARY KEY(`digestId`,`storyId`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`title` varchar(280) NOT NULL,
	`dek` text NOT NULL,
	`body` text NOT NULL,
	`contentType` enum('news','analysis','guide','culture','video') NOT NULL DEFAULT 'news',
	`status` enum('draft','developing','published','archived') NOT NULL DEFAULT 'draft',
	`categoryId` int NOT NULL,
	`authorName` varchar(160) NOT NULL DEFAULT 'CasinoVerse Research Desk',
	`readingMinutes` int NOT NULL DEFAULT 4,
	`featuredImageUrl` text,
	`featuredImageAlt` varchar(280),
	`isLead` boolean NOT NULL DEFAULT false,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`modifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`),
	CONSTRAINT `stories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `story_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`publisher` varchar(180) NOT NULL,
	`sourceTitle` text NOT NULL,
	`sourceUrl` text NOT NULL,
	`sourcePublishedAt` timestamp,
	`accessedAt` timestamp NOT NULL DEFAULT (now()),
	`sourceType` enum('official','regulator','filing','trade','news','research') NOT NULL DEFAULT 'news',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `story_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `daily_digests_status_idx` ON `daily_digests` (`status`,`digestDate`);--> statement-breakpoint
CREATE INDEX `digest_stories_story_idx` ON `digest_stories` (`storyId`);--> statement-breakpoint
CREATE INDEX `digest_stories_position_idx` ON `digest_stories` (`digestId`,`position`);--> statement-breakpoint
CREATE INDEX `stories_category_idx` ON `stories` (`categoryId`);--> statement-breakpoint
CREATE INDEX `stories_status_published_idx` ON `stories` (`status`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `stories_content_type_idx` ON `stories` (`contentType`);--> statement-breakpoint
CREATE INDEX `story_sources_story_idx` ON `story_sources` (`storyId`);