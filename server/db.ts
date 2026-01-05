import { eq, and, or, desc, lt, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  userProfiles,
  wallets,
  transactions,
  tutoringRequests,
  tutoringSessions,
  progressNotes,
  notifications,
  parentStudentRelationships,
  teacherStudentRelationships,
  stripePayments,
  socialFeedPosts,
  socialFeedLikes,
  socialFeedComments,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(
  userId: number,
  profileData: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userProfiles)
      .set(profileData)
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({
      userId,
      userType: "student",
      ...profileData,
    });
  }
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Wallet Operations
 */
export async function getOrCreateWallet(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new wallet with 0 balance
  await db.insert(wallets).values({
    userId,
    balanceCoins: 0,
    totalEarned: 0,
    totalSpent: 0,
  });

  const newWallet = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  return newWallet[0];
}

export async function getWalletBalance(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const wallet = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  return wallet.length > 0 ? wallet[0].balanceCoins : null;
}

/**
 * Transaction Operations - Core financial logic
 * Implements idempotency to prevent double-spending
 */
export async function createTransaction(
  userId: number,
  data: {
    transactionType: typeof transactions.$inferInsert["transactionType"];
    amountCoins: number;
    amountTnd?: string;
    status?: "pending" | "completed" | "failed" | "refunded";
    sessionId?: number;
    stripeTransactionId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    idempotencyKey?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const idempotencyKey = data.idempotencyKey || nanoid();

  // Check if transaction with same idempotency key already exists
  const existing = await db
    .select()
    .from(transactions)
    .where(eq(transactions.idempotencyKey, idempotencyKey))
    .limit(1);

  if (existing.length > 0) {
    console.log("[Transaction] Duplicate detected, returning existing:", idempotencyKey);
    return existing[0];
  }

  await db.insert(transactions).values({
    userId,
    transactionType: data.transactionType,
    amountCoins: data.amountCoins,
    amountTnd: data.amountTnd,
    status: data.status || "pending",
    sessionId: data.sessionId,
    stripeTransactionId: data.stripeTransactionId,
    description: data.description,
    metadata: data.metadata,
    idempotencyKey,
  });

  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.idempotencyKey, idempotencyKey))
    .limit(1);

  return result[0];
}

/**
 * Process wallet transaction with balance update
 * Handles both deductions and additions
 */
export async function processWalletTransaction(
  userId: number,
  amountCoins: number,
  transactionType: typeof transactions.$inferInsert["transactionType"],
  metadata?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get wallet
  const wallet = await getOrCreateWallet(userId);
  if (!wallet) throw new Error("Failed to get wallet");

  // Check balance for deductions
  if (amountCoins < 0 && wallet.balanceCoins < Math.abs(amountCoins)) {
    throw new Error("Insufficient balance");
  }

  // Create transaction record
  const transaction = await createTransaction(userId, {
    transactionType,
    amountCoins: Math.abs(amountCoins),
    status: "completed",
    metadata,
  });

  // Update wallet balance
  const newBalance = wallet.balanceCoins + amountCoins;
  const updateData: Record<string, unknown> = {
    balanceCoins: newBalance,
  };

  if (amountCoins > 0) {
    updateData.totalEarned = wallet.totalEarned + amountCoins;
  } else {
    updateData.totalSpent = wallet.totalSpent + Math.abs(amountCoins);
  }

  await db.update(wallets).set(updateData).where(eq(wallets.userId, userId));

  return transaction;
}

/**
 * Tutoring Request Operations
 */
export async function createTutoringRequest(
  studentId: number,
  data: {
    subject: string;
    description?: string;
    urgency?: "low" | "medium" | "high";
    maxBudgetCoins?: number;
    preferredMentorId?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(tutoringRequests).values({
    studentId,
    subject: data.subject,
    description: data.description,
    urgency: data.urgency || "medium",
    maxBudgetCoins: data.maxBudgetCoins || null,
    preferredMentorId: data.preferredMentorId,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Expire in 15 minutes
  });

  const result = await db
    .select()
    .from(tutoringRequests)
    .where(eq(tutoringRequests.studentId, studentId))
    .orderBy(desc(tutoringRequests.requestedAt))
    .limit(1);

  return result[0];
}

export async function getOpenTutoringRequests(subject?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(tutoringRequests.status, "open"),
    lt(tutoringRequests.expiresAt, new Date()), // Not expired
  ];

  if (subject) {
    conditions.push(eq(tutoringRequests.subject, subject));
  }

  const results = await db
    .select()
    .from(tutoringRequests)
    .where(and(...conditions))
    .orderBy(desc(tutoringRequests.requestedAt));

  return results;
}

export async function acceptTutoringRequest(
  requestId: number,
  mentorId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const request = await db
    .select()
    .from(tutoringRequests)
    .where(eq(tutoringRequests.id, requestId))
    .limit(1);

  if (!request.length) throw new Error("Request not found");
  if (request[0].status !== "open") throw new Error("Request already handled");

  // Update request status
  await db
    .update(tutoringRequests)
    .set({
      status: "accepted",
      acceptedByMentorId: mentorId,
      acceptedAt: new Date(),
    })
    .where(eq(tutoringRequests.id, requestId));

  // Create session
  await db.insert(tutoringSessions).values({
    requestId,
    studentId: request[0].studentId,
    mentorId,
    subject: request[0].subject,
    coinsCharged: 10, // Base cost: 10 EduCoins
  });

  const session = await db
    .select()
    .from(tutoringSessions)
    .where(eq(tutoringSessions.requestId, requestId))
    .limit(1);

  return session[0];
}

export async function rejectTutoringRequest(
  requestId: number,
  mentorId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const request = await db
    .select()
    .from(tutoringRequests)
    .where(eq(tutoringRequests.id, requestId))
    .limit(1);

  if (!request.length) throw new Error("Request not found");

  const rejectedIds = request[0].rejectedByMentorIds || [];
  if (!rejectedIds.includes(mentorId)) {
    rejectedIds.push(mentorId);
  }

  await db
    .update(tutoringRequests)
    .set({
      rejectedByMentorIds: rejectedIds,
    })
    .where(eq(tutoringRequests.id, requestId));
}

/**
 * Get available mentors by subject
 */
export async function getAvailableMentorsBySubject(subject: string) {
  const db = await getDb();
  if (!db) return [];

  // This is a simplified query - in production, you'd want more sophisticated matching
  const results = await db
    .select()
    .from(userProfiles)
    .where(
      and(
        eq(userProfiles.userType, "mentor"),
        eq(userProfiles.mentorStatus, "online")
        // Note: mentorSpecialties is JSON, would need custom SQL for proper matching
      )
    );

  return results;
}

/**
 * Progress Notes Operations
 */
export async function createProgressNote(
  teacherId: number,
  studentId: number,
  data: {
    subject?: string;
    content: string;
    visibleToParent?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(progressNotes).values({
    teacherId,
    studentId,
    subject: data.subject,
    content: data.content,
    visibleToParent: data.visibleToParent !== false,
  });

  const result = await db
    .select()
    .from(progressNotes)
    .where(eq(progressNotes.studentId, studentId))
    .orderBy(desc(progressNotes.noteDate))
    .limit(1);

  return result[0];
}

export async function getProgressNotesForStudent(
  studentId: number,
  visibleToParentOnly = false
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(progressNotes.studentId, studentId)];
  if (visibleToParentOnly) {
    conditions.push(eq(progressNotes.visibleToParent, true));
  }

  const results = await db
    .select()
    .from(progressNotes)
    .where(and(...conditions))
    .orderBy(desc(progressNotes.noteDate));

  return results;
}

/**
 * Notification Operations
 */
export async function createNotification(
  userId: number,
  data: {
    type: typeof notifications.$inferInsert["type"];
    title: string;
    message?: string;
    relatedEntityType?: string;
    relatedEntityId?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notifications).values({
    userId,
    type: data.type,
    title: data.title,
    message: data.message,
    relatedEntityType: data.relatedEntityType,
    relatedEntityId: data.relatedEntityId,
  });

  // Return the created notification
  const result = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(1);

  return result[0];
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      )
    )
    .orderBy(desc(notifications.createdAt));

  return results;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(eq(notifications.id, notificationId));
}

/**
 * Social Feed Operations
 */
export async function createSocialPost(
  userId: number,
  data: {
    content: string;
    postType?: "achievement" | "milestone" | "resource" | "question" | "update";
    visibility?: "public" | "class_only" | "private";
    imageUrl?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(socialFeedPosts).values({
    userId,
    content: data.content,
    postType: data.postType || "update",
    visibility: data.visibility || "public",
    imageUrl: data.imageUrl,
  });

  const result = await db
    .select()
    .from(socialFeedPosts)
    .where(eq(socialFeedPosts.userId, userId))
    .orderBy(desc(socialFeedPosts.createdAt))
    .limit(1);

  return result[0];
}

export async function getSocialFeed(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(socialFeedPosts)
    .where(eq(socialFeedPosts.visibility, "public"))
    .orderBy(desc(socialFeedPosts.createdAt))
    .limit(limit)
    .offset(offset);

  return results;
}

export async function likeSocialPost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already liked
  const existing = await db
    .select()
    .from(socialFeedLikes)
    .where(
      and(
        eq(socialFeedLikes.postId, postId),
        eq(socialFeedLikes.userId, userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Unlike
    await db
      .delete(socialFeedLikes)
      .where(
        and(
          eq(socialFeedLikes.postId, postId),
          eq(socialFeedLikes.userId, userId)
        )
      );
    return { liked: false };
  }

  // Like
  await db.insert(socialFeedLikes).values({
    postId,
    userId,
  });

  // Get current post and update like count
  const post = await db
    .select()
    .from(socialFeedPosts)
    .where(eq(socialFeedPosts.id, postId))
    .limit(1);

  if (post.length > 0) {
    await db
      .update(socialFeedPosts)
      .set({
        likesCount: (post[0].likesCount || 0) + 1,
      })
      .where(eq(socialFeedPosts.id, postId));
  }

  return { liked: true };
}

export async function commentOnSocialPost(
  postId: number,
  userId: number,
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(socialFeedComments).values({
    postId,
    userId,
    content,
  });

  // Get current post and update comment count
  const post = await db
    .select()
    .from(socialFeedPosts)
    .where(eq(socialFeedPosts.id, postId))
    .limit(1);

  if (post.length > 0) {
    await db
      .update(socialFeedPosts)
      .set({
        commentsCount: (post[0].commentsCount || 0) + 1,
      })
      .where(eq(socialFeedPosts.id, postId));
  }
}

/**
 * Stripe Payment Operations
 */
export async function createStripePayment(
  userId: number,
  data: {
    paymentType: "topup" | "withdrawal";
    amountTnd: string;
    amountCoins: number;
    stripePaymentIntentId?: string;
    stripeCheckoutSessionId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(stripePayments).values({
    userId,
    paymentType: data.paymentType,
    amountTnd: data.amountTnd,
    amountCoins: data.amountCoins,
    stripePaymentIntentId: data.stripePaymentIntentId,
    stripeCheckoutSessionId: data.stripeCheckoutSessionId,
    metadata: data.metadata,
  });

  const result = await db
    .select()
    .from(stripePayments)
    .where(eq(stripePayments.userId, userId))
    .orderBy(desc(stripePayments.createdAt))
    .limit(1);

  return result[0];
}

/**
 * Relationship Operations
 */
export async function linkParentToStudent(
  parentId: number,
  studentId: number,
  relationship: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(parentStudentRelationships).values({
    parentId,
    studentId,
    relationship,
  });
}

export async function getStudentsForParent(parentId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(parentStudentRelationships)
    .where(eq(parentStudentRelationships.parentId, parentId));

  return results;
}

export async function getParentsForStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(parentStudentRelationships)
    .where(eq(parentStudentRelationships.studentId, studentId));

  return results;
}
