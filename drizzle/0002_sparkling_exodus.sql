CREATE TABLE `publication_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobKey` varchar(96) NOT NULL,
	`schedule_cron_task_uid` varchar(65),
	`status` enum('pending_deploy','active','paused') NOT NULL DEFAULT 'pending_deploy',
	`lastCompletedDigestDate` date,
	`lastRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publication_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `publication_jobs_jobKey_unique` UNIQUE(`jobKey`),
	CONSTRAINT `publication_jobs_cron_uid_idx` UNIQUE(`schedule_cron_task_uid`)
);
