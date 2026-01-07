import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, longtext } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with subscription and profile information.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  profileImage: text("profileImage"), // S3 URL
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscription plans offered by the platform
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priceJpy: int("price_jpy").notNull(), // Price in JPY (e.g., 5000 for ¥5,000)
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull().unique(),
  features: longtext("features"), // JSON array of feature strings
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * User subscription records (tracks active subscriptions)
 */
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  planId: int("plan_id").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "incomplete"]).notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Limited gallery images for subscribers
 */
export const galleryImages = mysqlTable("gallery_images", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  s3Key: varchar("s3_key", { length: 512 }).notNull().unique(),
  thumbnailS3Key: varchar("thumbnail_s3_key", { length: 512 }),
  isSubscriberOnly: boolean("is_subscriber_only").default(true).notNull(),
  uploadedBy: int("uploaded_by").notNull(), // admin user id
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

/**
 * Individual image sales
 */
export const saleImages = mysqlTable("sale_images", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  s3Key: varchar("s3_key", { length: 512 }).notNull().unique(),
  thumbnailS3Key: varchar("thumbnail_s3_key", { length: 512 }),
  priceJpy: int("price_jpy").notNull(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
  uploadedBy: int("uploaded_by").notNull(), // admin user id
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SaleImage = typeof saleImages.$inferSelect;
export type InsertSaleImage = typeof saleImages.$inferInsert;

/**
 * Image purchase history
 */
export const imagePurchases = mysqlTable("image_purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  imageId: int("image_id").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).notNull().unique(),
  amountJpy: int("amount_jpy").notNull(),
  status: mysqlEnum("status", ["succeeded", "pending", "failed"]).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagePurchase = typeof imagePurchases.$inferSelect;
export type InsertImagePurchase = typeof imagePurchases.$inferInsert;

/**
 * Activity reports (audio + text posts by admin)
 */
export const activityReports = mysqlTable("activity_reports", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: longtext("content").notNull(), // Main text content
  audioS3Key: varchar("audio_s3_key", { length: 512 }), // Optional audio file
  postedBy: int("posted_by").notNull(), // admin user id
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActivityReport = typeof activityReports.$inferSelect;
export type InsertActivityReport = typeof activityReports.$inferInsert;

/**
 * Transaction records for revenue tracking
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  type: mysqlEnum("type", ["subscription", "image_purchase"]).notNull(),
  relatedId: int("related_id"), // subscription id or image_purchase id
  amountJpy: int("amount_jpy").notNull(),
  stripeId: varchar("stripe_id", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["succeeded", "pending", "failed"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
