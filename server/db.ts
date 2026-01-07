import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  subscriptionPlans,
  userSubscriptions,
  galleryImages,
  saleImages,
  imagePurchases,
  activityReports,
  transactions,
  SubscriptionPlan,
  UserSubscription,
  GalleryImage,
  SaleImage,
  ImagePurchase,
  ActivityReport,
  Transaction,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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
      values.role = 'admin';
      updateSet.role = 'admin';
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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== Subscription Plans =====

export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(subscriptionPlans.priceJpy);
}

export async function getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscriptionPlan(plan: {
  name: string;
  description?: string;
  priceJpy: number;
  stripePriceId: string;
  features?: string;
}): Promise<SubscriptionPlan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(subscriptionPlans).values(plan);
  const planId = result[0].insertId;
  const created = await getSubscriptionPlanById(Number(planId));
  if (!created) throw new Error("Failed to create subscription plan");
  return created;
}

// ===== User Subscriptions =====

export async function getUserActiveSubscription(userId: number): Promise<UserSubscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userSubscriptions)
    .where(and(
      eq(userSubscriptions.userId, userId),
      eq(userSubscriptions.status, "active")
    ))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserSubscriptionHistory(userId: number): Promise<UserSubscription[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .orderBy(desc(userSubscriptions.createdAt));
}

export async function createUserSubscription(subscription: {
  userId: number;
  planId: number;
  stripeSubscriptionId: string;
  status: "active" | "canceled" | "past_due" | "incomplete";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}): Promise<UserSubscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(userSubscriptions).values(subscription);
  const subId = result[0].insertId;
  const created = await db.select().from(userSubscriptions)
    .where(eq(userSubscriptions.id, Number(subId)))
    .limit(1);
  if (!created || created.length === 0) throw new Error("Failed to create subscription");
  return created[0];
}

export async function updateUserSubscriptionStatus(
  subscriptionId: number,
  status: "active" | "canceled" | "past_due" | "incomplete"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(userSubscriptions)
    .set({ status, updatedAt: new Date() })
    .where(eq(userSubscriptions.id, subscriptionId));
}

// ===== Gallery Images =====

export async function getGalleryImages(subscriberOnly: boolean = false): Promise<GalleryImage[]> {
  const db = await getDb();
  if (!db) return [];
  
  const query = subscriberOnly 
    ? db.select().from(galleryImages).where(eq(galleryImages.isSubscriberOnly, true))
    : db.select().from(galleryImages);
  
  return query.orderBy(desc(galleryImages.createdAt));
}

export async function getGalleryImageById(id: number): Promise<GalleryImage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGalleryImage(image: {
  title: string;
  description?: string;
  s3Key: string;
  thumbnailS3Key?: string;
  isSubscriberOnly?: boolean;
  uploadedBy: number;
}): Promise<GalleryImage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(galleryImages).values({
    ...image,
    isSubscriberOnly: image.isSubscriberOnly ?? true,
  });
  const imageId = result[0].insertId;
  const created = await getGalleryImageById(Number(imageId));
  if (!created) throw new Error("Failed to create gallery image");
  return created;
}

// ===== Sale Images =====

export async function getSaleImages(): Promise<SaleImage[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(saleImages)
    .where(eq(saleImages.isActive, true))
    .orderBy(desc(saleImages.createdAt));
}

export async function getSaleImageById(id: number): Promise<SaleImage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(saleImages)
    .where(eq(saleImages.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSaleImage(image: {
  title: string;
  description?: string;
  s3Key: string;
  thumbnailS3Key?: string;
  priceJpy: number;
  stripePriceId: string;
  uploadedBy: number;
}): Promise<SaleImage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(saleImages).values(image);
  const imageId = result[0].insertId;
  const created = await getSaleImageById(Number(imageId));
  if (!created) throw new Error("Failed to create sale image");
  return created;
}

// ===== Image Purchases =====

export async function getUserPurchases(userId: number): Promise<ImagePurchase[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(imagePurchases)
    .where(eq(imagePurchases.userId, userId))
    .orderBy(desc(imagePurchases.purchasedAt));
}

export async function createImagePurchase(purchase: {
  userId: number;
  imageId: number;
  stripePaymentIntentId: string;
  amountJpy: number;
  status: "succeeded" | "pending" | "failed";
}): Promise<ImagePurchase> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(imagePurchases).values(purchase);
  const purchaseId = result[0].insertId;
  const created = await db.select().from(imagePurchases)
    .where(eq(imagePurchases.id, Number(purchaseId)))
    .limit(1);
  if (!created || created.length === 0) throw new Error("Failed to create purchase");
  return created[0];
}

// ===== Activity Reports =====

export async function getActivityReports(limit: number = 20, offset: number = 0): Promise<ActivityReport[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(activityReports)
    .where(eq(activityReports.isPublished, true))
    .orderBy(desc(activityReports.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getActivityReportById(id: number): Promise<ActivityReport | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(activityReports)
    .where(eq(activityReports.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createActivityReport(report: {
  title: string;
  content: string;
  audioS3Key?: string;
  postedBy: number;
  isPublished?: boolean;
}): Promise<ActivityReport> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(activityReports).values({
    ...report,
    isPublished: report.isPublished ?? true,
  });
  const reportId = result[0].insertId;
  const created = await getActivityReportById(Number(reportId));
  if (!created) throw new Error("Failed to create activity report");
  return created;
}

// ===== Transactions =====

export async function createTransaction(transaction: {
  userId: number;
  type: "subscription" | "image_purchase";
  relatedId?: number;
  amountJpy: number;
  stripeId: string;
  status: "succeeded" | "pending" | "failed";
}): Promise<Transaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(transactions).values(transaction);
  const txId = result[0].insertId;
  const created = await db.select().from(transactions)
    .where(eq(transactions.id, Number(txId)))
    .limit(1);
  if (!created || created.length === 0) throw new Error("Failed to create transaction");
  return created[0];
}

export async function getRevenueStats(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, subscriptionRevenue: 0, saleRevenue: 0, transactionCount: 0 };
  
  const results = await db.select().from(transactions)
    .where(and(
      gte(transactions.createdAt, startDate),
      lte(transactions.createdAt, endDate),
      eq(transactions.status, "succeeded")
    ));
  
  let totalRevenue = 0;
  let subscriptionRevenue = 0;
  let saleRevenue = 0;
  
  results.forEach(tx => {
    if (tx.type === "subscription") {
      subscriptionRevenue += tx.amountJpy;
    } else {
      saleRevenue += tx.amountJpy;
    }
    totalRevenue += tx.amountJpy;
  });
  
  return {
    totalRevenue,
    subscriptionRevenue,
    saleRevenue,
    transactionCount: results.length,
  };
}
