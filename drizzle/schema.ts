import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  bigint,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with multi-role support for EduConnect Tunisia.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User Profiles - Extended role-specific data
 * Stores profile information for each user role (Student, Mentor, Parent, SchoolAdmin)
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  userType: mysqlEnum("user_type", ["student", "mentor", "parent", "school_admin"]).notNull(),
  
  // Student-specific fields
  studentGrade: varchar("student_grade", { length: 50 }), // e.g., "3ème", "Bac"
  studentSchool: varchar("student_school", { length: 255 }),
  
  // Mentor-specific fields
  mentorSpecialties: json("mentor_specialties").$type<string[]>(), // ["Math", "Physics", "French"]
  mentorBio: text("mentor_bio"),
  mentorRating: decimal("mentor_rating", { precision: 3, scale: 2 }).default("5.00"),
  mentorHourlyRate: decimal("mentor_hourly_rate", { precision: 10, scale: 2 }), // in TND
  mentorStatus: mysqlEnum("mentor_status", ["offline", "online", "busy"]).default("offline"),
  
  // Parent-specific fields
  parentChildren: json("parent_children").$type<number[]>(), // Array of student user IDs
  
  // School Admin-specific fields
  adminSchoolName: varchar("admin_school_name", { length: 255 }),
  adminPermissions: json("admin_permissions").$type<string[]>(), // ["manage_teachers", "manage_students"]
  
  // Common fields
  phoneNumber: varchar("phone_number", { length: 20 }),
  profilePhotoUrl: varchar("profile_photo_url", { length: 512 }),
  language: mysqlEnum("language", ["fr", "en", "ar"]).default("fr"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Wallet System - EduCoin management
 * 1 TND = 10 EduCoins
 * Stores wallet balance for all users
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  balanceCoins: bigint("balance_coins", { mode: "number" }).default(0).notNull(), // in EduCoins
  totalEarned: bigint("total_earned", { mode: "number" }).default(0).notNull(), // Total coins earned (mentors)
  totalSpent: bigint("total_spent", { mode: "number" }).default(0).notNull(), // Total coins spent (students)
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Transactions - Complete audit trail
 * Prevents double-spending and tracks all wallet movements
 * Status: pending, completed, failed, refunded
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  transactionType: mysqlEnum("transaction_type", [
    "topup_stripe",      // Student recharge via Stripe
    "session_deduction", // Student pays for session
    "session_earning",   // Mentor earns from session
    "withdrawal",        // Mentor withdraws to TND
    "refund",            // Refund transaction
    "admin_adjustment",  // Admin manual adjustment
  ]).notNull(),
  
  amountCoins: bigint("amount_coins", { mode: "number" }).notNull(),
  amountTnd: decimal("amount_tnd", { precision: 10, scale: 3 }), // Optional, for conversions
  
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  
  // References
  sessionId: int("session_id"), // For session-related transactions
  stripeTransactionId: varchar("stripe_transaction_id", { length: 255 }), // For Stripe transactions
  relatedTransactionId: int("related_transaction_id"), // For refunds/reversals
  
  // Idempotence key to prevent double-processing
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  
  description: text("description"),
  metadata: json("metadata"), // Additional data (e.g., session details)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Tutoring Requests - Uber-style matching
 * Students request help by subject, mentors see available requests
 */
export const tutoringRequests = mysqlTable("tutoring_requests", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("student_id").notNull(),
  
  subject: varchar("subject", { length: 100 }).notNull(), // "Math", "Physics", "French", etc.
  description: text("description"), // Student's question/topic
  urgency: mysqlEnum("urgency", ["low", "medium", "high"]).default("medium"),
  
  status: mysqlEnum("status", ["open", "accepted", "rejected", "expired", "completed"]).default("open"),
  
  acceptedByMentorId: int("accepted_by_mentor_id"),
  rejectedByMentorIds: json("rejected_by_mentor_ids").$type<number[]>(), // Track who declined
  
  // Matching filters
  preferredMentorId: int("preferred_mentor_id"), // Optional: student can request specific mentor
  maxBudgetCoins: bigint("max_budget_coins", { mode: "number" }), // Max coins willing to spend
  
  // Timing
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Auto-expire after 15 minutes if not accepted
  acceptedAt: timestamp("accepted_at"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TutoringRequest = typeof tutoringRequests.$inferSelect;
export type InsertTutoringRequest = typeof tutoringRequests.$inferInsert;

/**
 * Tutoring Sessions - Active sessions between student and mentor
 * Tracks session details, duration, and payment
 */
export const tutoringSessions = mysqlTable("tutoring_sessions", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("request_id").notNull(),
  studentId: int("student_id").notNull(),
  mentorId: int("mentor_id").notNull(),
  
  subject: varchar("subject", { length: 100 }).notNull(),
  
  status: mysqlEnum("status", ["active", "paused", "completed", "cancelled"]).default("active"),
  
  // Session details
  sessionNotes: text("session_notes"), // What was covered
  studentFeedback: text("student_feedback"),
  mentorNotes: text("mentor_notes"),
  
  // Duration and cost
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  durationMinutes: int("duration_minutes"),
  
  coinsCharged: bigint("coins_charged", { mode: "number" }).notNull(), // 10 coins per session (base)
  transactionId: int("transaction_id"), // Reference to transaction
  
  // Rating
  studentRating: int("student_rating"), // 1-5
  mentorRating: int("mentor_rating"), // 1-5
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TutoringSession = typeof tutoringSessions.$inferSelect;
export type InsertTutoringSession = typeof tutoringSessions.$inferInsert;

/**
 * Progress Notes - Teacher-Student-Parent communication
 * Teachers leave notes visible to parents
 */
export const progressNotes = mysqlTable("progress_notes", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacher_id").notNull(),
  studentId: int("student_id").notNull(),
  
  subject: varchar("subject", { length: 100 }),
  content: text("content").notNull(), // Daily remarks
  
  visibleToParent: boolean("visible_to_parent").default(true),
  
  // Metadata
  noteDate: timestamp("note_date").defaultNow(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProgressNote = typeof progressNotes.$inferSelect;
export type InsertProgressNote = typeof progressNotes.$inferInsert;

/**
 * Social Feed Posts - LinkedIn-style achievements
 * Students and mentors share academic achievements
 */
export const socialFeedPosts = mysqlTable("social_feed_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  
  content: text("content").notNull(),
  postType: mysqlEnum("post_type", ["achievement", "milestone", "resource", "question", "update"]).default("update"),
  
  // Visibility
  visibility: mysqlEnum("visibility", ["public", "class_only", "private"]).default("public"),
  classId: int("class_id"), // For class-only posts
  
  // Engagement
  likesCount: int("likes_count").default(0),
  commentsCount: int("comments_count").default(0),
  sharesCount: int("shares_count").default(0),
  
  // Media
  imageUrl: varchar("image_url", { length: 512 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialFeedPost = typeof socialFeedPosts.$inferSelect;
export type InsertSocialFeedPost = typeof socialFeedPosts.$inferInsert;

/**
 * Social Feed Likes - Track likes on posts
 */
export const socialFeedLikes = mysqlTable("social_feed_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("post_id").notNull(),
  userId: int("user_id").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialFeedLike = typeof socialFeedLikes.$inferSelect;
export type InsertSocialFeedLike = typeof socialFeedLikes.$inferInsert;

/**
 * Social Feed Comments - Comments on posts
 */
export const socialFeedComments = mysqlTable("social_feed_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("post_id").notNull(),
  userId: int("user_id").notNull(),
  
  content: text("content").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialFeedComment = typeof socialFeedComments.$inferSelect;
export type InsertSocialFeedComment = typeof socialFeedComments.$inferInsert;

/**
 * Notifications - In-app notification system
 * Tracks all notifications sent to users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  
  type: mysqlEnum("type", [
    "tutor_request",        // New tutor request
    "request_accepted",     // Request accepted by mentor
    "request_rejected",     // Request rejected by mentor
    "session_started",      // Session started
    "session_completed",    // Session completed
    "progress_note",        // New progress note from teacher
    "social_like",          // Someone liked your post
    "social_comment",       // Someone commented on your post
    "payment_received",     // Payment received
    "withdrawal_processed", // Withdrawal processed
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  
  // Reference to related entity
  relatedEntityType: varchar("related_entity_type", { length: 50 }), // "tutoring_request", "session", etc.
  relatedEntityId: int("related_entity_id"),
  
  isRead: boolean("is_read").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Parent-Student Relationships
 * Links parents to their children (students)
 */
export const parentStudentRelationships = mysqlTable("parent_student_relationships", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parent_id").notNull(),
  studentId: int("student_id").notNull(),
  
  relationship: varchar("relationship", { length: 50 }), // "father", "mother", "guardian"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParentStudentRelationship = typeof parentStudentRelationships.$inferSelect;
export type InsertParentStudentRelationship = typeof parentStudentRelationships.$inferInsert;

/**
 * Teacher-Student Relationships
 * Links teachers to their students
 */
export const teacherStudentRelationships = mysqlTable("teacher_student_relationships", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacher_id").notNull(),
  studentId: int("student_id").notNull(),
  
  subject: varchar("subject", { length: 100 }),
  classId: int("class_id"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeacherStudentRelationship = typeof teacherStudentRelationships.$inferSelect;
export type InsertTeacherStudentRelationship = typeof teacherStudentRelationships.$inferInsert;

/**
 * Stripe Payment Records
 * Tracks all Stripe transactions for audit and reconciliation
 */
export const stripePayments = mysqlTable("stripe_payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  
  paymentType: mysqlEnum("payment_type", ["topup", "withdrawal"]).notNull(),
  
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).unique(),
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", { length: 255 }).unique(),
  
  amountTnd: decimal("amount_tnd", { precision: 10, scale: 3 }).notNull(),
  amountCoins: bigint("amount_coins", { mode: "number" }).notNull(),
  
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending"),
  
  transactionId: int("transaction_id"), // Reference to transaction table
  
  metadata: json("metadata"), // Additional Stripe metadata
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type StripePayment = typeof stripePayments.$inferSelect;
export type InsertStripePayment = typeof stripePayments.$inferInsert;

/**
 * Relations for Drizzle ORM
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  transactions: many(transactions),
  studentRequests: many(tutoringRequests, {
    relationName: "student",
  }),
  mentorSessions: many(tutoringSessions, {
    relationName: "mentor",
  }),
  studentSessions: many(tutoringSessions, {
    relationName: "student",
  }),
  progressNotes: many(progressNotes),
  socialPosts: many(socialFeedPosts),
  notifications: many(notifications),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const tutoringRequestsRelations = relations(tutoringRequests, ({ one }) => ({
  student: one(users, {
    fields: [tutoringRequests.studentId],
    references: [users.id],
    relationName: "student",
  }),
  acceptedMentor: one(users, {
    fields: [tutoringRequests.acceptedByMentorId],
    references: [users.id],
  }),
}));

export const tutoringSessionsRelations = relations(tutoringSessions, ({ one }) => ({
  request: one(tutoringRequests, {
    fields: [tutoringSessions.requestId],
    references: [tutoringRequests.id],
  }),
  student: one(users, {
    fields: [tutoringSessions.studentId],
    references: [users.id],
    relationName: "student",
  }),
  mentor: one(users, {
    fields: [tutoringSessions.mentorId],
    references: [users.id],
    relationName: "mentor",
  }),
  transaction: one(transactions, {
    fields: [tutoringSessions.transactionId],
    references: [transactions.id],
  }),
}));

export const progressNotesRelations = relations(progressNotes, ({ one }) => ({
  teacher: one(users, {
    fields: [progressNotes.teacherId],
    references: [users.id],
  }),
  student: one(users, {
    fields: [progressNotes.studentId],
    references: [users.id],
  }),
}));

export const socialFeedPostsRelations = relations(socialFeedPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [socialFeedPosts.userId],
    references: [users.id],
  }),
  likes: many(socialFeedLikes),
  comments: many(socialFeedComments),
}));

export const socialFeedLikesRelations = relations(socialFeedLikes, ({ one }) => ({
  post: one(socialFeedPosts, {
    fields: [socialFeedLikes.postId],
    references: [socialFeedPosts.id],
  }),
  user: one(users, {
    fields: [socialFeedLikes.userId],
    references: [users.id],
  }),
}));

export const socialFeedCommentsRelations = relations(socialFeedComments, ({ one }) => ({
  post: one(socialFeedPosts, {
    fields: [socialFeedComments.postId],
    references: [socialFeedPosts.id],
  }),
  user: one(users, {
    fields: [socialFeedComments.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const parentStudentRelationshipsRelations = relations(parentStudentRelationships, ({ one }) => ({
  parent: one(users, {
    fields: [parentStudentRelationships.parentId],
    references: [users.id],
  }),
  student: one(users, {
    fields: [parentStudentRelationships.studentId],
    references: [users.id],
  }),
}));

export const teacherStudentRelationshipsRelations = relations(teacherStudentRelationships, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherStudentRelationships.teacherId],
    references: [users.id],
  }),
  student: one(users, {
    fields: [teacherStudentRelationships.studentId],
    references: [users.id],
  }),
}));

export const stripePaymentsRelations = relations(stripePayments, ({ one }) => ({
  user: one(users, {
    fields: [stripePayments.userId],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [stripePayments.transactionId],
    references: [transactions.id],
  }),
}));
