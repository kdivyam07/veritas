CREATE TABLE `documents` (
	`id` text NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`content` text NOT NULL,
	`status` text NOT NULL,
	`access` text NOT NULL,
	`updated` text NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`id`, `owner`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`question` text NOT NULL,
	`outcome` text NOT NULL,
	`detail` text NOT NULL,
	`created` text NOT NULL
);
