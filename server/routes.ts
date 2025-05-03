import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertEventSchema, insertClubSchema } from "@shared/schema";
import { ZodError } from "zod";
import process from "process";

// Initialize session secret
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = "campus-connect-secret-key";
  console.warn("Warning: Using default session secret. For production, set SESSION_SECRET environment variable.");
}

// Middleware to ensure user is authenticated
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to ensure user is an admin
const isAdmin = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user.role === "ADMIN") {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // API routes
  // Events routes
  app.get("/api/events", isAuthenticated, async (req, res) => {
    try {
      const categoryFilter = req.query.category as string;
      const dateFilter = req.query.date as string;
      const searchQuery = req.query.search as string;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const events = await storage.getEvents({ 
        categoryFilter,
        dateFilter,
        searchQuery,
        limit, 
        offset 
      });
      
      // Add isRegistered property for the current user
      const eventsWithReg = await Promise.all(
        events.map(async (event) => {
          const registration = await storage.getEventRegistration(event.id, req.user.id);
          return {
            ...event,
            isRegistered: !!registration
          };
        })
      );
      
      res.json(eventsWithReg);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/events/upcoming", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const upcomingEvents = await storage.getUpcomingEvents(limit);
      
      // Add isRegistered property for the current user
      const eventsWithReg = await Promise.all(
        upcomingEvents.map(async (event) => {
          const registration = await storage.getEventRegistration(event.id, req.user.id);
          return {
            ...event,
            isRegistered: !!registration
          };
        })
      );
      
      res.json(eventsWithReg);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/events/categories", isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getCategories("event");
      res.json(categories);
    } catch (error) {
      console.error("Error fetching event categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEventById(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const registration = await storage.getEventRegistration(eventId, req.user.id);
      
      res.json({
        ...event,
        isRegistered: !!registration
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/events/:id/register", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if event exists
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Register for the event
      const registration = await storage.registerForEvent(eventId, userId);
      
      res.status(201).json(registration);
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Clubs routes
  app.get("/api/clubs", isAuthenticated, async (req, res) => {
    try {
      const categoryFilter = req.query.category as string;
      const searchQuery = req.query.search as string;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const clubs = await storage.getClubs({ 
        categoryFilter,
        searchQuery,
        limit, 
        offset 
      });
      
      // Add isMember property for the current user
      const clubsWithMembership = await Promise.all(
        clubs.map(async (club) => {
          const membership = await storage.getClubMembership(club.id, req.user.id);
          return {
            ...club,
            isMember: !!membership
          };
        })
      );
      
      res.json(clubsWithMembership);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/clubs/categories", isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getCategories("club");
      res.json(categories);
    } catch (error) {
      console.error("Error fetching club categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/clubs/:id", isAuthenticated, async (req, res) => {
    try {
      const clubId = parseInt(req.params.id);
      const club = await storage.getClubById(clubId);
      
      if (!club) {
        return res.status(404).json({ message: "Club not found" });
      }
      
      const membership = await storage.getClubMembership(clubId, req.user.id);
      
      res.json({
        ...club,
        isMember: !!membership
      });
    } catch (error) {
      console.error("Error fetching club:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/clubs/:id/join", isAuthenticated, async (req, res) => {
    try {
      const clubId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if club exists
      const club = await storage.getClubById(clubId);
      if (!club) {
        return res.status(404).json({ message: "Club not found" });
      }
      
      // Join the club
      const membership = await storage.joinClub(clubId, userId);
      
      res.status(201).json(membership);
    } catch (error) {
      console.error("Error joining club:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // User specific routes
  app.get("/api/users/events", isAuthenticated, async (req, res) => {
    try {
      const registeredEvents = await storage.getUserRegisteredEvents(req.user.id);
      res.json(registeredEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/clubs", isAuthenticated, async (req, res) => {
    try {
      const userClubs = await storage.getUserClubs(req.user.id);
      res.json(userClubs);
    } catch (error) {
      console.error("Error fetching user clubs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/activities", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const activities = await storage.getUserActivities(req.user.id, limit, offset);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/calendar", isAuthenticated, async (req, res) => {
    try {
      // Get user's registered events for the calendar
      const events = await storage.getUserRegisteredEvents(req.user.id);
      
      // Format events for calendar display
      const calendarEvents = events.map(event => {
        // Determine color based on event categories
        let color = "primary";
        if (event.categories) {
          if (event.categories.includes("workshop")) color = "secondary";
          else if (event.categories.includes("cultural")) color = "accent";
          else if (event.categories.includes("career")) color = "destructive";
        }
        
        return {
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          color
        };
      });
      
      res.json(calendarEvents);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin routes
  app.get("/api/admin/events", isAdmin, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching admin events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/events", isAdmin, async (req, res) => {
    try {
      // Create schema for validation
      const schema = insertEventSchema.extend({
        categories: z.string().or(z.array(z.string())),
      });
      
      // Validate the request
      const data = schema.parse({
        ...req.body,
        createdBy: req.user.id,
      });
      
      // Format categories
      const categories = Array.isArray(data.categories) 
        ? data.categories 
        : [data.categories];
      
      // Create the event
      const event = await storage.createEvent({
        ...data,
        categories,
      });
      
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/admin/events/:id", isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Check if event exists
      const existingEvent = await storage.getEventById(eventId);
      if (!existingEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Create schema for validation
      const schema = insertEventSchema.extend({
        categories: z.string().or(z.array(z.string())),
      });
      
      // Validate the request
      const data = schema.parse({
        ...req.body,
        createdBy: existingEvent.createdBy || req.user.id,
      });
      
      // Format categories
      const categories = Array.isArray(data.categories) 
        ? data.categories 
        : [data.categories];
      
      // Update the event
      const updatedEvent = await storage.updateEvent(eventId, {
        ...data,
        categories,
      });
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/admin/events/:id", isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Delete the event
      const success = await storage.deleteEvent(eventId);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/admin/clubs", isAdmin, async (req, res) => {
    try {
      const clubs = await storage.getClubs();
      res.json(clubs);
    } catch (error) {
      console.error("Error fetching admin clubs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/clubs", isAdmin, async (req, res) => {
    try {
      // Validate the request
      const data = insertClubSchema.parse({
        ...req.body,
        createdBy: req.user.id,
      });
      
      // Create the club
      const club = await storage.createClub(data);
      
      res.status(201).json(club);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating club:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/admin/clubs/:id", isAdmin, async (req, res) => {
    try {
      const clubId = parseInt(req.params.id);
      
      // Check if club exists
      const existingClub = await storage.getClubById(clubId);
      if (!existingClub) {
        return res.status(404).json({ message: "Club not found" });
      }
      
      // Validate the request
      const data = insertClubSchema.parse({
        ...req.body,
        createdBy: existingClub.createdBy || req.user.id,
      });
      
      // Update the club
      const updatedClub = await storage.updateClub(clubId, data);
      
      if (!updatedClub) {
        return res.status(404).json({ message: "Club not found" });
      }
      
      res.json(updatedClub);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating club:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/admin/clubs/:id", isAdmin, async (req, res) => {
    try {
      const clubId = parseInt(req.params.id);
      
      // Delete the club
      const success = await storage.deleteClub(clubId);
      
      if (!success) {
        return res.status(404).json({ message: "Club not found" });
      }
      
      res.status(200).json({ message: "Club deleted successfully" });
    } catch (error) {
      console.error("Error deleting club:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/admin/analytics", isAdmin, async (req, res) => {
    try {
      const usersCount = await storage.getUsersCount();
      const eventsCount = await storage.getEventsCount();
      const clubsCount = await storage.getClubsCount();
      const eventsByMonth = await storage.getEventsByMonth();
      const topEvents = await storage.getTopEvents();
      const topClubs = await storage.getTopClubs();
      
      res.json({
        usersCount,
        eventsCount,
        clubsCount,
        eventsByMonth,
        topEvents,
        topClubs
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
