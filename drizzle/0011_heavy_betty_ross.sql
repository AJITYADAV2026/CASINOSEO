CREATE TABLE `historical_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(220) NOT NULL,
	`eventYear` int NOT NULL,
	`eventDate` date,
	`datePrecision` enum('exact','month','year') NOT NULL DEFAULT 'year',
	`title` varchar(280) NOT NULL,
	`desk` enum('industry_and_regulation','operations_and_technology','games_and_game_literacy','places_architecture_destinations','culture_and_media','responsible_play_and_harm') NOT NULL,
	`jurisdiction` varchar(180) NOT NULL,
	`summary` text NOT NULL,
	`significance` text NOT NULL,
	`sourceCatalogId` int,
	`sourceName` varchar(220) NOT NULL,
	`sourceTitle` text NOT NULL,
	`sourceUrl` text NOT NULL,
	`sourcePublishedDate` date,
	`sourceType` enum('official','regulator','legislation','research','trade','news','filing') NOT NULL DEFAULT 'research',
	`confidence` enum('high','medium') NOT NULL DEFAULT 'high',
	`verificationStatus` enum('verified','review_needed','rejected') NOT NULL DEFAULT 'verified',
	`cutoffLabel` varchar(80) NOT NULL DEFAULT 'through-2026-09-03',
	`isPublished` boolean NOT NULL DEFAULT true,
	`accessedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `historical_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `historical_records_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `historical_records_year_idx` ON `historical_records` (`eventYear`,`eventDate`);--> statement-breakpoint
CREATE INDEX `historical_records_desk_idx` ON `historical_records` (`desk`,`eventYear`);--> statement-breakpoint
CREATE INDEX `historical_records_source_idx` ON `historical_records` (`sourceCatalogId`);--> statement-breakpoint
CREATE INDEX `historical_records_publish_idx` ON `historical_records` (`isPublished`,`verificationStatus`);