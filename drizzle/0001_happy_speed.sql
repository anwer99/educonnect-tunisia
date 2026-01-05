CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('tutor_request','request_accepted','request_rejected','session_started','session_completed','progress_note','social_like','social_comment','payment_received','withdrawal_processed') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`related_entity_type` varchar(50),
	`related_entity_id` int,
	`is_read` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`read_at` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parent_student_relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parent_id` int NOT NULL,
	`student_id` int NOT NULL,
	`relationship` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parent_student_relationships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacher_id` int NOT NULL,
	`student_id` int NOT NULL,
	`subject` varchar(100),
	`content` text NOT NULL,
	`visible_to_parent` boolean DEFAULT true,
	`note_date` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `progress_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_feed_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_feed_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_feed_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_feed_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_feed_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`post_type` enum('achievement','milestone','resource','question','update') DEFAULT 'update',
	`visibility` enum('public','class_only','private') DEFAULT 'public',
	`class_id` int,
	`likes_count` int DEFAULT 0,
	`comments_count` int DEFAULT 0,
	`shares_count` int DEFAULT 0,
	`image_url` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_feed_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stripe_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`payment_type` enum('topup','withdrawal') NOT NULL,
	`stripe_payment_intent_id` varchar(255),
	`stripe_checkout_session_id` varchar(255),
	`amount_tnd` decimal(10,3) NOT NULL,
	`amount_coins` bigint NOT NULL,
	`status` enum('pending','completed','failed','cancelled') DEFAULT 'pending',
	`transaction_id` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `stripe_payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_payments_stripe_payment_intent_id_unique` UNIQUE(`stripe_payment_intent_id`),
	CONSTRAINT `stripe_payments_stripe_checkout_session_id_unique` UNIQUE(`stripe_checkout_session_id`)
);
--> statement-breakpoint
CREATE TABLE `teacher_student_relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacher_id` int NOT NULL,
	`student_id` int NOT NULL,
	`subject` varchar(100),
	`class_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teacher_student_relationships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`transaction_type` enum('topup_stripe','session_deduction','session_earning','withdrawal','refund','admin_adjustment') NOT NULL,
	`amount_coins` bigint NOT NULL,
	`amount_tnd` decimal(10,3),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`session_id` int,
	`stripe_transaction_id` varchar(255),
	`related_transaction_id` int,
	`idempotency_key` varchar(255),
	`description` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_idempotency_key_unique` UNIQUE(`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `tutoring_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`description` text,
	`urgency` enum('low','medium','high') DEFAULT 'medium',
	`status` enum('open','accepted','rejected','expired','completed') DEFAULT 'open',
	`accepted_by_mentor_id` int,
	`rejected_by_mentor_ids` json,
	`preferred_mentor_id` int,
	`max_budget_coins` bigint,
	`requested_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp,
	`accepted_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutoring_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tutoring_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_id` int NOT NULL,
	`student_id` int NOT NULL,
	`mentor_id` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`status` enum('active','paused','completed','cancelled') DEFAULT 'active',
	`session_notes` text,
	`student_feedback` text,
	`mentor_notes` text,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`ended_at` timestamp,
	`duration_minutes` int,
	`coins_charged` bigint NOT NULL,
	`transaction_id` int,
	`student_rating` int,
	`mentor_rating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutoring_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`user_type` enum('student','mentor','parent','school_admin') NOT NULL,
	`student_grade` varchar(50),
	`student_school` varchar(255),
	`mentor_specialties` json,
	`mentor_bio` text,
	`mentor_rating` decimal(3,2) DEFAULT '5.00',
	`mentor_hourly_rate` decimal(10,2),
	`mentor_status` enum('offline','online','busy') DEFAULT 'offline',
	`parent_children` json,
	`admin_school_name` varchar(255),
	`admin_permissions` json,
	`phone_number` varchar(20),
	`profile_photo_url` varchar(512),
	`language` enum('fr','en','ar') DEFAULT 'fr',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`balance_coins` bigint NOT NULL DEFAULT 0,
	`total_earned` bigint NOT NULL DEFAULT 0,
	`total_spent` bigint NOT NULL DEFAULT 0,
	`last_updated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallets_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);