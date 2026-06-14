import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./DB/index.js";
import User from "./models/User.model.js";
import Community from "./models/Community.model.js";
import Challenge from "./models/Challenge.model.js";
import { Artwork } from "./models/Artwork.model.js";

// Load environment variables
dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Community.deleteMany({});
        await Challenge.deleteMany({});
        await Artwork.deleteMany({});

        console.log("Creating mock users (password is 'password123')...");
        // Using User.create triggers the pre-save hook to hash passwords
        const users = await User.create([
            {
                username: "johndoe",
                email: "john@example.com",
                password: "password123",
                profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                bio: "Digital Artist & Designer",
                skills: ["Digital Art", "UI/UX", "Illustration"],
            },
            {
                username: "janedoe",
                email: "jane@example.com",
                password: "password123",
                profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                bio: "3D Modeler and Animator",
                skills: ["3D Modeling", "Animation", "Blender"],
            },
            {
                username: "alexsmith",
                email: "alex@example.com",
                password: "password123",
                profilePicture: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                bio: "Concept Artist and Illustrator",
                skills: ["Concept Art", "Character Design", "Photoshop"],
            }
        ]);

        console.log("Creating mock communities...");
        const communities = await Community.insertMany([
            {
                name: "Digital Art Enthusiasts",
                description: "A place for digital artists to share and critique work.",
                admin: users[0]._id,
                members: [users[0]._id, users[1]._id, users[2]._id]
            },
            {
                name: "3D Modeling Hub",
                description: "Everything related to 3D modeling, Blender, Maya, and ZBrush.",
                admin: users[1]._id,
                members: [users[1]._id, users[2]._id]
            }
        ]);

        console.log("Creating mock artworks...");
        const artworks = await Artwork.insertMany([
            {
                title: "Cyberpunk Cityscape",
                description: "A futuristic cityscape at night with neon lights.",
                image: "https://images.unsplash.com/photo-1515630278258-407f66498911?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
                owner: users[0]._id,
                community: communities[0]._id,
                tags: ["Cyberpunk", "City", "Neon"],
                likes: [users[1]._id, users[2]._id]
            },
            {
                title: "Fantasy Character Concept",
                description: "Concept art for a fantasy RPG character.",
                image: "https://images.unsplash.com/photo-1578301978018-3005759f48f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
                owner: users[2]._id,
                community: communities[0]._id,
                tags: ["Fantasy", "Character", "Concept Art"],
                likes: [users[0]._id]
            },
            {
                title: "Abstract 3D Render",
                description: "Exploring geometry and lighting in Blender.",
                image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
                owner: users[1]._id,
                community: communities[1]._id,
                tags: ["3D", "Abstract", "Blender"],
                likes: [users[0]._id, users[2]._id]
            }
        ]);

        console.log("Creating mock challenges...");
        await Challenge.insertMany([
            {
                title: "Daily Sketch: Sci-Fi Vehicles",
                description: "Create a concept sketch for a futuristic vehicle.",
                community: communities[0]._id,
                createdBy: users[0]._id,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                maxPoints: 100
            },
            {
                title: "Low Poly Character",
                description: "Model a low poly character suitable for a mobile game.",
                community: communities[1]._id,
                createdBy: users[1]._id,
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                maxPoints: 200
            }
        ]);

        console.log("Database seeded successfully! You can login with email: john@example.com and password: password123");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedData();
