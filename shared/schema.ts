import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define role enum for users
export const userRoleEnum = pgEnum('user_role', ['STUDENT', 'ADMIN']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").default("STUDENT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  value: text("value").notNull().unique(),
  type: text("type").notNull(), // 'event' or 'club'
});

// Event categories relationship table
export const eventCategories = pgTable("event_categories", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
});

// Event registrations table
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

// Clubs table
export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Club memberships table
export const clubMemberships = pgTable("club_memberships", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => clubs.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Club meetings table
export const clubMeetings = pgTable("club_meetings", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").references(() => clubs.id).notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity points table
export const activityPoints = pgTable("activity_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  points: integer("points").notNull(),
  activityType: text("activity_type").notNull(), // 'event_attendance', 'club_membership', etc.
  entityId: integer("entity_id").notNull(), // ID of the related entity (event, club, etc.)
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  description: text("description").notNull(),
});

// User activities table
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(), // 'event_registered', 'club_joined', 'points_earned', 'comment_posted'
  entityId: integer("entity_id").notNull(), // ID of the related entity
  entityName: text("entity_name").notNull(), // Name of the related entity
  points: integer("points"), // Optional points earned
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events),
  eventRegistrations: many(eventRegistrations),
  clubMemberships: many(clubMemberships),
  activityPoints: many(activityPoints),
  activities: many(userActivities),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, { fields: [events.createdBy], references: [users.id] }),
  registrations: many(eventRegistrations),
  categories: many(eventCategories),
}));

export const clubsRelations = relations(clubs, ({ one, many }) => ({
  creator: one(users, { fields: [clubs.createdBy], references: [users.id] }),
  memberships: many(clubMemberships),
  meetings: many(clubMeetings),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, { fields: [eventRegistrations.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRegistrations.userId], references: [users.id] }),
}));

export const clubMembershipsRelations = relations(clubMemberships, ({ one }) => ({
  club: one(clubs, { fields: [clubMemberships.clubId], references: [clubs.id] }),
  user: one(users, { fields: [clubMemberships.userId], references: [users.id] }),
}));

export const eventCategoriesRelations = relations(eventCategories, ({ one }) => ({
  event: one(events, { fields: [eventCategories.eventId], references: [events.id] }),
  category: one(categories, { fields: [eventCategories.categoryId], references: [categories.id] }),
}));

export const activityPointsRelations = relations(activityPoints, ({ one }) => ({
  user: one(users, { fields: [activityPoints.userId], references: [users.id] }),
}));

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, { fields: [userActivities.userId], references: [users.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
});

export const insertEventSchema = createInsertSchema(events, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

export const insertClubSchema = createInsertSchema(clubs, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations);
export const insertClubMembershipSchema = createInsertSchema(clubMemberships);
export const insertActivityPointSchema = createInsertSchema(activityPoints);
export const insertUserActivitySchema = createInsertSchema(userActivities);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubs.$inferSelect;

export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;

export type InsertClubMembership = z.infer<typeof insertClubMembershipSchema>;
export type ClubMembership = typeof clubMemberships.$inferSelect;

export type InsertActivityPoint = z.infer<typeof insertActivityPointSchema>;
export type ActivityPoint = typeof activityPoints.$inferSelect;

export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof userActivities.$inferSelect;

export type Category = typeof categories.$inferSelect;
export type EventCategory = typeof eventCategories.$inferSelect;
export type ClubMeeting = typeof clubMeetings.$inferSelect;
