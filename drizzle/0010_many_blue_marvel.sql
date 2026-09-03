CREATE TABLE `source_catalog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`name` varchar(220) NOT NULL,
	`publicationLabel` varchar(220),
	`description` text NOT NULL,
	`sourceType` enum('official','regulator','research','journalism','standards','industry','education','health') NOT NULL DEFAULT 'research',
	`originalUrl` text NOT NULL,
	`accessedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `source_catalog_id` PRIMARY KEY(`id`),
	CONSTRAINT `source_catalog_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `support_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`name` varchar(220) NOT NULL,
	`jurisdiction` varchar(180) NOT NULL,
	`serviceType` enum('helpline','counselling','self_exclusion','financial_blocking','emergency','information') NOT NULL DEFAULT 'information',
	`summary` text NOT NULL,
	`phone` varchar(80),
	`contactInstructions` text NOT NULL,
	`originalUrl` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`verifiedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_resources_id` PRIMARY KEY(`id`),
	CONSTRAINT `support_resources_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `source_catalog_type_idx` ON `source_catalog` (`sourceType`);--> statement-breakpoint
CREATE INDEX `source_catalog_status_idx` ON `source_catalog` (`status`);--> statement-breakpoint
CREATE INDEX `support_resources_jurisdiction_idx` ON `support_resources` (`jurisdiction`);--> statement-breakpoint
CREATE INDEX `support_resources_active_idx` ON `support_resources` (`isActive`,`sortOrder`);