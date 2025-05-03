import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Beginning database seed...");
    
    // Check if users already exist before adding
    const existingUsers = await db.query.users.findMany();
    if (existingUsers.length === 0) {
      // Create admin and student users
      console.log("Creating users...");
      await db.insert(schema.users).values([
        {
          username: "admin",
          password: await hashPassword("admin123"),
          role: "ADMIN"
        },
        {
          username: "student",
          password: await hashPassword("student123"),
          role: "STUDENT"
        }
      ]);
      console.log("Created users successfully");
    } else {
      console.log("Users already exist, skipping user creation");
    }
    
    // Check if categories already exist before adding
    const existingCategories = await db.query.categories.findMany();
    if (existingCategories.length === 0) {
      // Create event categories
      console.log("Creating categories...");
      await db.insert(schema.categories).values([
        { name: "Career", value: "career", type: "event" },
        { name: "Workshop", value: "workshop", type: "event" },
        { name: "Cultural", value: "cultural", type: "event" },
        { name: "Academic", value: "academic", type: "event" },
        { name: "Sports", value: "sports", type: "event" },
        { name: "Coding", value: "coding", type: "club" },
        { name: "Chess", value: "chess", type: "club" },
        { name: "Music", value: "music", type: "club" },
        { name: "Basketball", value: "basketball", type: "club" },
        { name: "Literature", value: "literature", type: "club" },
        { name: "Art", value: "art", type: "club" },
        { name: "Photography", value: "photography", type: "club" },
        { name: "Volunteer", value: "volunteer", type: "club" },
        { name: "International", value: "international", type: "club" }
      ]);
      console.log("Created categories successfully");
    } else {
      console.log("Categories already exist, skipping category creation");
    }
    
    // Check if events already exist before adding
    const existingEvents = await db.query.events.findMany();
    if (existingEvents.length === 0) {
      // Get admin user id
      const adminUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, "admin")
      });
      
      if (!adminUser) {
        throw new Error("Admin user not found");
      }
      
      // Create events
      console.log("Creating events...");
      const careerEvent = await db.insert(schema.events).values({
        title: "Spring Career Fair 2023",
        description: "Connect with over 50 top employers looking to hire students across all majors.",
        date: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
        time: "10:00 AM",
        location: "Student Union Ballroom",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&h=300",
        createdBy: adminUser.id
      }).returning();
      
      const workshopEvent = await db.insert(schema.events).values({
        title: "Full-Stack Development Workshop",
        description: "Learn the fundamentals of modern web development in this hands-on workshop.",
        date: new Date(new Date().getTime() + (9 * 24 * 60 * 60 * 1000)), // 9 days from now
        time: "2:00 PM",
        location: "Engineering Building, Room 305",
        imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&h=300",
        createdBy: adminUser.id
      }).returning();
      
      const culturalEvent = await db.insert(schema.events).values({
        title: "International Culture Festival",
        description: "Celebrate diversity with performances, food, and activities from around the world.",
        date: new Date(new Date().getTime() + (12 * 24 * 60 * 60 * 1000)), // 12 days from now
        time: "5:30 PM",
        location: "Campus Green",
        imageUrl: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=600&h=300",
        createdBy: adminUser.id
      }).returning();
      
      // Get category IDs
      const careerCategory = await db.query.categories.findFirst({
        where: (categories, { eq }) => eq(categories.value, "career")
      });
      
      const workshopCategory = await db.query.categories.findFirst({
        where: (categories, { eq }) => eq(categories.value, "workshop")
      });
      
      const culturalCategory = await db.query.categories.findFirst({
        where: (categories, { eq }) => eq(categories.value, "cultural")
      });
      
      if (!careerCategory || !workshopCategory || !culturalCategory) {
        throw new Error("Categories not found");
      }
      
      // Create event categories relationships
      await db.insert(schema.eventCategories).values([
        { eventId: careerEvent[0].id, categoryId: careerCategory.id },
        { eventId: workshopEvent[0].id, categoryId: workshopCategory.id },
        { eventId: culturalEvent[0].id, categoryId: culturalCategory.id }
      ]);
      
      console.log("Created events successfully");
    } else {
      console.log("Events already exist, skipping event creation");
    }
    
    // Check if clubs already exist before adding
    const existingClubs = await db.query.clubs.findMany();
    if (existingClubs.length === 0) {
      // Get admin user id
      const adminUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, "admin")
      });
      
      if (!adminUser) {
        throw new Error("Admin user not found");
      }
      
      // Create clubs
      console.log("Creating clubs...");
      const codingClub = await db.insert(schema.clubs).values({
        name: "Coding Club",
        description: "Weekly meetups to learn programming languages and collaborate on projects.",
        category: "coding",
        createdBy: adminUser.id
      }).returning();
      
      const chessClub = await db.insert(schema.clubs).values({
        name: "Chess Club",
        description: "From beginners to masters, join us to improve your chess skills and make friends.",
        category: "chess",
        createdBy: adminUser.id
      }).returning();
      
      const musicClub = await db.insert(schema.clubs).values({
        name: "Music Society",
        description: "For all music enthusiasts to perform, learn and share their passion for music.",
        category: "music",
        createdBy: adminUser.id
      }).returning();
      
      const basketballClub = await db.insert(schema.clubs).values({
        name: "Basketball Team",
        description: "Recreational and competitive basketball for all skill levels.",
        category: "basketball",
        createdBy: adminUser.id
      }).returning();
      
      // Create club meetings
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const friday = new Date(today);
      friday.setDate(friday.getDate() + (5 + (friday.getDay() > 5 ? 7 - friday.getDay() : 5 - friday.getDay())));
      
      const saturday = new Date(today);
      saturday.setDate(saturday.getDate() + (6 + (saturday.getDay() > 6 ? 7 - saturday.getDay() : 6 - saturday.getDay())));
      
      await db.insert(schema.clubMeetings).values([
        {
          clubId: codingClub[0].id,
          date: tomorrow,
          time: "6:00 PM",
          location: "Computer Science Building, Room 101"
        },
        {
          clubId: chessClub[0].id,
          date: friday,
          time: "4:00 PM",
          location: "Student Center, Game Room"
        },
        {
          clubId: musicClub[0].id,
          date: saturday,
          time: "3:00 PM",
          location: "Arts Building, Music Room"
        },
        {
          clubId: basketballClub[0].id,
          date: today,
          time: "7:30 PM",
          location: "University Gym, Court 2"
        }
      ]);
      
      console.log("Created clubs successfully");
    } else {
      console.log("Clubs already exist, skipping club creation");
    }
    
    console.log("Database seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
