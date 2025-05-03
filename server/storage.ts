import { db } from "@db";
import { 
  users, 
  events, 
  clubs, 
  categories, 
  eventCategories, 
  eventRegistrations, 
  clubMemberships, 
  clubMeetings, 
  activityPoints, 
  userActivities,
  InsertUser, 
  User 
} from "@shared/schema";
import { eq, and, desc, asc, sql, or, like, isNull, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event methods
  getEvents(options?: { 
    categoryFilter?: string; 
    dateFilter?: string; 
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  getEventById(id: number): Promise<any | undefined>;
  createEvent(eventData: any): Promise<any>;
  updateEvent(id: number, eventData: any): Promise<any | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  registerForEvent(eventId: number, userId: number): Promise<any>;
  getEventRegistration(eventId: number, userId: number): Promise<any | undefined>;
  getUserRegisteredEvents(userId: number): Promise<any[]>;
  getUpcomingEvents(limit?: number): Promise<any[]>;
  
  // Club methods
  getClubs(options?: { 
    categoryFilter?: string; 
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  getClubById(id: number): Promise<any | undefined>;
  createClub(clubData: any): Promise<any>;
  updateClub(id: number, clubData: any): Promise<any | undefined>;
  deleteClub(id: number): Promise<boolean>;
  joinClub(clubId: number, userId: number): Promise<any>;
  getClubMembership(clubId: number, userId: number): Promise<any | undefined>;
  getUserClubs(userId: number): Promise<any[]>;
  
  // Category methods
  getCategories(type: string): Promise<any[]>;
  
  // Activity methods
  getUserActivities(userId: number, limit?: number, offset?: number): Promise<any[]>;
  addUserActivity(activityData: any): Promise<any>;
  getUserStats(userId: number): Promise<any>;
  
  // Admin methods
  getUsersCount(): Promise<number>;
  getEventsCount(): Promise<number>;
  getClubsCount(): Promise<number>;
  getEventsByMonth(): Promise<any[]>;
  getTopEvents(): Promise<any[]>;
  getTopClubs(): Promise<any[]>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return result;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async getEvents(options?: { 
    categoryFilter?: string; 
    dateFilter?: string; 
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { categoryFilter, dateFilter, searchQuery, limit = 100, offset = 0 } = options || {};
    
    let query = db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      date: events.date,
      time: events.time,
      location: events.location,
      imageUrl: events.imageUrl,
      createdAt: events.createdAt,
      categoryIds: sql<number[]>`array_agg(distinct ${eventCategories.categoryId})`,
      categoryNames: sql<string[]>`array_agg(distinct ${categories.name})`,
      registrationCount: sql<number>`count(distinct ${eventRegistrations.id})`,
    })
    .from(events)
    .leftJoin(eventCategories, eq(events.id, eventCategories.eventId))
    .leftJoin(categories, eq(eventCategories.categoryId, categories.id))
    .leftJoin(eventRegistrations, eq(events.id, eventRegistrations.eventId))
    .groupBy(events.id);
    
    const conditions = [];
    
    if (searchQuery) {
      conditions.push(like(events.title, `%${searchQuery}%`));
    }
    
    if (categoryFilter && categoryFilter !== 'all') {
      // Join with event_categories and categories to filter by category
      query = query.where(eq(categories.value, categoryFilter));
    }
    
    if (dateFilter) {
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          conditions.push(sql`date_trunc('day', ${events.date}) = date_trunc('day', now())`);
          break;
        case 'this-week':
          conditions.push(sql`date_trunc('week', ${events.date}) = date_trunc('week', now())`);
          break;
        case 'this-month':
          conditions.push(sql`date_trunc('month', ${events.date}) = date_trunc('month', now())`);
          break;
        case 'upcoming':
          conditions.push(sql`${events.date} >= now()`);
          break;
        case 'past':
          conditions.push(sql`${events.date} < now()`);
          break;
      }
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(asc(events.date))
                .limit(limit)
                .offset(offset);
    
    const eventsResult = await query;
    
    return eventsResult.map(event => ({
      ...event,
      categories: event.categoryNames || [],
    }));
  }
  
  async getEventById(id: number): Promise<any | undefined> {
    const [event] = await db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      date: events.date,
      time: events.time,
      location: events.location,
      imageUrl: events.imageUrl,
      createdAt: events.createdAt,
      categoryIds: sql<number[]>`array_agg(distinct ${eventCategories.categoryId})`,
      categoryNames: sql<string[]>`array_agg(distinct ${categories.name})`,
      registrationCount: sql<number>`count(distinct ${eventRegistrations.id})`,
    })
    .from(events)
    .leftJoin(eventCategories, eq(events.id, eventCategories.eventId))
    .leftJoin(categories, eq(eventCategories.categoryId, categories.id))
    .leftJoin(eventRegistrations, eq(events.id, eventRegistrations.eventId))
    .where(eq(events.id, id))
    .groupBy(events.id);
    
    if (!event) return undefined;
    
    return {
      ...event,
      categories: event.categoryNames || [],
    };
  }
  
  async createEvent(eventData: any): Promise<any> {
    const { categories: categoryValues, ...eventValues } = eventData;
    
    // Create event first
    const [event] = await db.insert(events).values(eventValues).returning();
    
    // Assign categories if provided
    if (categoryValues && categoryValues.length > 0) {
      // Get category IDs
      const categoryIds = await this.getCategoryIds(categoryValues);
      
      // Add event categories
      await Promise.all(
        categoryIds.map(categoryId => 
          db.insert(eventCategories).values({
            eventId: event.id,
            categoryId,
          })
        )
      );
    }
    
    return this.getEventById(event.id);
  }
  
  private async getCategoryIds(categoryValues: string[]): Promise<number[]> {
    const categoryResults = await db.select()
      .from(categories)
      .where(sql`${categories.value} IN ${categoryValues}`);
    
    return categoryResults.map(cat => cat.id);
  }
  
  async updateEvent(id: number, eventData: any): Promise<any | undefined> {
    const { categories: categoryValues, ...eventValues } = eventData;
    
    // Update event
    const [updatedEvent] = await db.update(events)
      .set(eventValues)
      .where(eq(events.id, id))
      .returning();
    
    if (!updatedEvent) return undefined;
    
    // Update categories if provided
    if (categoryValues && categoryValues.length > 0) {
      // Delete existing categories
      await db.delete(eventCategories).where(eq(eventCategories.eventId, id));
      
      // Get category IDs
      const categoryIds = await this.getCategoryIds(categoryValues);
      
      // Add new categories
      await Promise.all(
        categoryIds.map(categoryId => 
          db.insert(eventCategories).values({
            eventId: id,
            categoryId,
          })
        )
      );
    }
    
    return this.getEventById(id);
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    // Delete related registrations first
    await db.delete(eventRegistrations).where(eq(eventRegistrations.eventId, id));
    
    // Delete related categories
    await db.delete(eventCategories).where(eq(eventCategories.eventId, id));
    
    // Delete event
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount > 0;
  }
  
  async registerForEvent(eventId: number, userId: number): Promise<any> {
    // Check if already registered
    const existingReg = await this.getEventRegistration(eventId, userId);
    if (existingReg) {
      return existingReg;
    }
    
    // Create registration
    const [registration] = await db.insert(eventRegistrations)
      .values({
        eventId,
        userId,
      })
      .returning();
    
    // Add activity points
    await db.insert(activityPoints)
      .values({
        userId,
        points: 10, // Default points for event registration
        activityType: 'event_registration',
        entityId: eventId,
        description: 'Registered for an event',
      });
    
    // Get event details for activity log
    const event = await this.getEventById(eventId);
    
    // Add to user activity log
    await this.addUserActivity({
      userId,
      activityType: 'event_registered',
      entityId: eventId,
      entityName: event.title,
      points: 10,
    });
    
    return registration;
  }
  
  async getEventRegistration(eventId: number, userId: number): Promise<any | undefined> {
    const result = await db.query.eventRegistrations.findFirst({
      where: and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, userId)
      ),
    });
    
    return result;
  }
  
  async getUserRegisteredEvents(userId: number): Promise<any[]> {
    const registrations = await db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      date: events.date,
      time: events.time,
      location: events.location,
      imageUrl: events.imageUrl,
      registeredAt: eventRegistrations.registeredAt,
      isRegistered: sql<boolean>`true`,
    })
    .from(eventRegistrations)
    .innerJoin(events, eq(eventRegistrations.eventId, events.id))
    .where(eq(eventRegistrations.userId, userId))
    .orderBy(asc(events.date));
    
    return registrations;
  }
  
  async getUpcomingEvents(limit = 3): Promise<any[]> {
    const eventsResult = await db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      date: events.date,
      time: events.time,
      location: events.location,
      imageUrl: events.imageUrl,
      categoryIds: sql<number[]>`array_agg(distinct ${eventCategories.categoryId})`,
      categoryNames: sql<string[]>`array_agg(distinct ${categories.name})`,
    })
    .from(events)
    .leftJoin(eventCategories, eq(events.id, eventCategories.eventId))
    .leftJoin(categories, eq(eventCategories.categoryId, categories.id))
    .where(sql`${events.date} >= now()`)
    .groupBy(events.id)
    .orderBy(asc(events.date))
    .limit(limit);
    
    return eventsResult.map(event => ({
      ...event,
      categories: event.categoryNames || [],
    }));
  }
  
  async getClubs(options?: { 
    categoryFilter?: string; 
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { categoryFilter, searchQuery, limit = 100, offset = 0 } = options || {};
    
    let query = db.select({
      id: clubs.id,
      name: clubs.name,
      description: clubs.description,
      category: clubs.category,
      createdAt: clubs.createdAt,
      memberCount: sql<number>`count(distinct ${clubMemberships.id})`,
    })
    .from(clubs)
    .leftJoin(clubMemberships, eq(clubs.id, clubMemberships.clubId))
    .groupBy(clubs.id);
    
    if (searchQuery) {
      query = query.where(like(clubs.name, `%${searchQuery}%`));
    }
    
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.where(eq(clubs.category, categoryFilter));
    }
    
    query = query.orderBy(desc(sql<number>`count(distinct ${clubMemberships.id})`))
                .limit(limit)
                .offset(offset);
    
    return await query;
  }
  
  async getClubById(id: number): Promise<any | undefined> {
    const [club] = await db.select({
      id: clubs.id,
      name: clubs.name,
      description: clubs.description,
      category: clubs.category,
      createdAt: clubs.createdAt,
      memberCount: sql<number>`count(distinct ${clubMemberships.id})`,
    })
    .from(clubs)
    .leftJoin(clubMemberships, eq(clubs.id, clubMemberships.clubId))
    .where(eq(clubs.id, id))
    .groupBy(clubs.id);
    
    if (!club) return undefined;
    
    // Get next meeting if any
    const nextMeeting = await db.query.clubMeetings.findFirst({
      where: and(
        eq(clubMeetings.clubId, id),
        sql`${clubMeetings.date} >= now()`
      ),
      orderBy: asc(clubMeetings.date),
    });
    
    return {
      ...club,
      nextMeeting: nextMeeting ? {
        date: nextMeeting.date,
        time: nextMeeting.time,
        location: nextMeeting.location,
      } : undefined,
    };
  }
  
  async createClub(clubData: any): Promise<any> {
    const [club] = await db.insert(clubs).values(clubData).returning();
    return this.getClubById(club.id);
  }
  
  async updateClub(id: number, clubData: any): Promise<any | undefined> {
    const [updatedClub] = await db.update(clubs)
      .set(clubData)
      .where(eq(clubs.id, id))
      .returning();
    
    if (!updatedClub) return undefined;
    
    return this.getClubById(id);
  }
  
  async deleteClub(id: number): Promise<boolean> {
    // Delete related memberships first
    await db.delete(clubMemberships).where(eq(clubMemberships.clubId, id));
    
    // Delete related meetings
    await db.delete(clubMeetings).where(eq(clubMeetings.clubId, id));
    
    // Delete club
    const result = await db.delete(clubs).where(eq(clubs.id, id));
    return result.rowCount > 0;
  }
  
  async joinClub(clubId: number, userId: number): Promise<any> {
    // Check if already a member
    const existingMembership = await this.getClubMembership(clubId, userId);
    if (existingMembership) {
      return existingMembership;
    }
    
    // Create membership
    const [membership] = await db.insert(clubMemberships)
      .values({
        clubId,
        userId,
      })
      .returning();
    
    // Add activity points
    await db.insert(activityPoints)
      .values({
        userId,
        points: 15, // Default points for joining a club
        activityType: 'club_membership',
        entityId: clubId,
        description: 'Joined a club',
      });
    
    // Get club details for activity log
    const club = await this.getClubById(clubId);
    
    // Add to user activity log
    await this.addUserActivity({
      userId,
      activityType: 'club_joined',
      entityId: clubId,
      entityName: club.name,
      points: 15,
    });
    
    return membership;
  }
  
  async getClubMembership(clubId: number, userId: number): Promise<any | undefined> {
    const result = await db.query.clubMemberships.findFirst({
      where: and(
        eq(clubMemberships.clubId, clubId),
        eq(clubMemberships.userId, userId)
      ),
    });
    
    return result;
  }
  
  async getUserClubs(userId: number): Promise<any[]> {
    const userClubs = await db.select({
      id: clubs.id,
      name: clubs.name,
      description: clubs.description,
      category: clubs.category,
      joinedAt: clubMemberships.joinedAt,
      isMember: sql<boolean>`true`,
    })
    .from(clubMemberships)
    .innerJoin(clubs, eq(clubMemberships.clubId, clubs.id))
    .where(eq(clubMemberships.userId, userId));
    
    // Fetch next meeting for each club
    const result = await Promise.all(
      userClubs.map(async (club) => {
        const nextMeeting = await db.query.clubMeetings.findFirst({
          where: and(
            eq(clubMeetings.clubId, club.id),
            sql`${clubMeetings.date} >= now()`
          ),
          orderBy: asc(clubMeetings.date),
        });
        
        let nextMeetingText;
        if (nextMeeting) {
          const meetingDate = new Date(nextMeeting.date);
          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);
          
          if (meetingDate.toDateString() === today.toDateString()) {
            nextMeetingText = `Today, ${nextMeeting.time}`;
          } else if (meetingDate.toDateString() === tomorrow.toDateString()) {
            nextMeetingText = `Tomorrow, ${nextMeeting.time}`;
          } else {
            nextMeetingText = `${meetingDate.toLocaleDateString(undefined, { weekday: 'long' })}, ${nextMeeting.time}`;
          }
        }
        
        return {
          ...club,
          nextMeeting: nextMeetingText,
          memberCount: await this.getClubMemberCount(club.id),
        };
      })
    );
    
    return result;
  }
  
  private async getClubMemberCount(clubId: number): Promise<number> {
    const result = await db.select({ count: count() })
      .from(clubMemberships)
      .where(eq(clubMemberships.clubId, clubId));
    
    return result[0]?.count || 0;
  }
  
  async getCategories(type: string): Promise<any[]> {
    return db.select()
      .from(categories)
      .where(eq(categories.type, type));
  }
  
  async getUserActivities(userId: number, limit = 10, offset = 0): Promise<any[]> {
    return db.select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.timestamp))
      .limit(limit)
      .offset(offset);
  }
  
  async addUserActivity(activityData: any): Promise<any> {
    const [activity] = await db.insert(userActivities)
      .values(activityData)
      .returning();
    
    return activity;
  }
  
  async getUserStats(userId: number): Promise<any> {
    // Get registered events count
    const registeredEventsResult = await db.select({ count: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.userId, userId));
    
    // Get club memberships count
    const clubMembershipsResult = await db.select({ count: count() })
      .from(clubMemberships)
      .where(eq(clubMemberships.userId, userId));
    
    // Get total activity points
    const pointsResult = await db.select({ sum: sql<number>`sum(${activityPoints.points})` })
      .from(activityPoints)
      .where(eq(activityPoints.userId, userId));
    
    // Get upcoming events count
    const upcomingEventsResult = await db.select({ count: count() })
      .from(eventRegistrations)
      .innerJoin(events, eq(eventRegistrations.eventId, events.id))
      .where(and(
        eq(eventRegistrations.userId, userId),
        sql`${events.date} >= now()`
      ));
    
    // Get next upcoming event
    const nextEvent = await db.select({
      id: events.id,
      title: events.title,
      date: events.date,
    })
    .from(eventRegistrations)
    .innerJoin(events, eq(eventRegistrations.eventId, events.id))
    .where(and(
      eq(eventRegistrations.userId, userId),
      sql`${events.date} >= now()`
    ))
    .orderBy(asc(events.date))
    .limit(1);
    
    return {
      registeredEvents: registeredEventsResult[0]?.count || 0,
      clubMemberships: clubMembershipsResult[0]?.count || 0,
      activityPoints: pointsResult[0]?.sum || 0,
      upcomingEvents: upcomingEventsResult[0]?.count || 0,
      nextEventName: nextEvent[0]?.title,
      nextEventId: nextEvent[0]?.id,
      nextEventDate: nextEvent[0]?.date,
    };
  }
  
  async getUsersCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0]?.count || 0;
  }
  
  async getEventsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(events);
    return result[0]?.count || 0;
  }
  
  async getClubsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(clubs);
    return result[0]?.count || 0;
  }
  
  async getEventsByMonth(): Promise<any[]> {
    const result = await db.select({
      month: sql<string>`to_char(${events.date}, 'Mon')`,
      count: count(),
    })
    .from(events)
    .where(sql`${events.date} >= date_trunc('year', now())`)
    .groupBy(sql`to_char(${events.date}, 'Mon')`)
    .orderBy(sql`to_char(${events.date}, 'MM')`);
    
    return result;
  }
  
  async getTopEvents(): Promise<any[]> {
    const result = await db.select({
      id: events.id,
      title: events.title,
      registrations: count(eventRegistrations.id),
    })
    .from(events)
    .leftJoin(eventRegistrations, eq(events.id, eventRegistrations.eventId))
    .groupBy(events.id)
    .orderBy(desc(count(eventRegistrations.id)))
    .limit(5);
    
    return result;
  }
  
  async getTopClubs(): Promise<any[]> {
    const result = await db.select({
      id: clubs.id,
      name: clubs.name,
      members: count(clubMemberships.id),
    })
    .from(clubs)
    .leftJoin(clubMemberships, eq(clubs.id, clubMemberships.clubId))
    .groupBy(clubs.id)
    .orderBy(desc(count(clubMemberships.id)))
    .limit(5);
    
    return result;
  }
}

// Create singleton instance
export const storage = new DatabaseStorage();
