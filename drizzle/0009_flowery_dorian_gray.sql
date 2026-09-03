CREATE TABLE `editorial_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(320) NOT NULL,
	`topic` enum('correction','privacy','newsletter','general') NOT NULL DEFAULT 'general',
	`message` text NOT NULL,
	`dedupeKey` varchar(64) NOT NULL,
	`consentAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('new','reviewed','resolved','spam') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `editorial_inquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `editorial_inquiries_dedupe_idx` UNIQUE(`dedupeKey`)
);
--> statement-breakpoint
CREATE INDEX `editorial_inquiries_status_idx` ON `editorial_inquiries` (`status`,`createdAt`);