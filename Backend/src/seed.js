import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./DB/index.js";
import User from "./models/User.model.js";
import Community from "./models/Community.model.js";
import Challenge from "./models/Challenge.model.js";
import { Artwork } from "./models/Artwork.model.js";
import Submission from "./models/Submission.model.js";

dotenv.config();

const usersData = [
    { username: "alex_art", email: "alex@example.com", bio: "Digital artist and concept designer." },
    { username: "jane_3d", email: "jane@example.com", bio: "3D Modeler." },
    { username: "john_doe", email: "john@example.com", bio: "Illustrator and sketch artist." },
    { username: "sarah_p", email: "sarah@example.com", bio: "Pixel art enthusiast." },
    { username: "mike_vfx", email: "mike@example.com", bio: "VFX artist." },
    { username: "emily_draws", email: "emily@example.com", bio: "Watercolor and traditional art." },
    { username: "david_sculpts", email: "david@example.com", bio: "ZBrush sculptor." },
    { username: "chris_ui", email: "chris@example.com", bio: "UI/UX designer." },
    { username: "jess_animates", email: "jess@example.com", bio: "2D Animator." },
    { username: "amanda_creative", email: "amanda@example.com", bio: "Creative director." },
    { username: "matt_renders", email: "matt@example.com", bio: "Blender guru." },
    { username: "ashley_paints", email: "ashley@example.com", bio: "Oil painter." },
    { username: "taylor_designs", email: "taylor@example.com", bio: "Graphic designer." },
    { username: "jordan_concept", email: "jordan@example.com", bio: "Environment concept artist." },
    { username: "ryan_sketch", email: "ryan@example.com", bio: "Character sketches." }
];

const seedData = async () => {
    try {
        await connectDB();

        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Community.deleteMany({});
        await Challenge.deleteMany({});
        await Artwork.deleteMany({});
        await Submission.deleteMany({});

        console.log("Creating mock users (password is 'password123')...");
        const users = [];
        for (const data of usersData) {
            const user = await User.create({
                username: data.username,
                email: data.email,
                password: "password123",
                bio: data.bio,
                skills: ["Digital Art", "Illustration"],
                profilePicture: `https://ui-avatars.com/api/?name=${data.username}&background=random`
            });
            users.push(user);
        }

        console.log("Creating mock communities...");
        const communitiesData = [];
        for (let i = 0; i < 15; i++) {
            // Every user creates exactly 1 community
            // Every user joins 2 other communities
            const members = [
                users[i]._id,
                users[(i + 1) % 15]._id,
                users[(i + 2) % 15]._id
            ];
            
            communitiesData.push({
                name: `${users[i].username}'s Studio`,
                description: `A creative space managed by ${users[i].username}.`,
                admin: users[i]._id,
                members: members
            });
        }
        const communities = await Community.insertMany(communitiesData);

        console.log("Creating mock artworks (posts)...");
        const artworksData = [];
        for(let i = 0; i < 30; i++) {
            const ownerIndex = i % 15;
            const communityIndex = (i + 1) % 15;
            artworksData.push({
                title: `Artwork Title ${i+1}`,
                description: `This is a wonderful piece of art created by ${users[ownerIndex].username}.`,
                image: `https://picsum.photos/seed/${i+100}/800/600`,
                owner: users[ownerIndex]._id,
                community: communities[communityIndex]._id,
                tags: ["Art", "Mock", "Creative"],
                likes: [users[(i+1)%15]._id, users[(i+2)%15]._id]
            });
        }
        const artworks = await Artwork.insertMany(artworksData);

        // Update users' posts
        for(let i=0; i<30; i++) {
            const ownerIndex = i % 15;
            await User.findByIdAndUpdate(users[ownerIndex]._id, { $push: { posts: artworks[i]._id } });
        }

        console.log("Creating mock challenges...");
        const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
        const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days from now

        const challengesData = [];
        for(let i = 0; i < 15; i++) {
            // Each community gets 1 ACTIVE and 1 PAST challenge
            challengesData.push({
                title: `Active Challenge in ${communities[i].name}`,
                description: "This is an ongoing creative challenge.",
                community: communities[i]._id,
                createdBy: communities[i].admin,
                deadline: futureDate,
                maxPoints: 100,
                status: "ACTIVE"
            });
            challengesData.push({
                title: `Past Challenge in ${communities[i].name}`,
                description: "This challenge has ended.",
                community: communities[i]._id,
                createdBy: communities[i].admin,
                deadline: pastDate,
                maxPoints: 200,
                status: "FINALIZED"
            });
        }
        const challenges = await Challenge.insertMany(challengesData);

        // Add challenges to communities
        for(const challenge of challenges) {
            await Community.findByIdAndUpdate(challenge.community, { $push: { challenges: challenge._id } });
        }

        console.log("Creating mock submissions and allocating points...");
        const submissionsData = [];

        // For each past challenge (odd indices in challenges array are FINALIZED, even are ACTIVE)
        for (let i = 0; i < challenges.length; i++) {
            const challenge = challenges[i];
            // Get a user who is NOT the admin to submit
            const cIndex = Math.floor(i / 2);
            const submitterIndex = (cIndex + 1) % 15;
            const submitterId = users[submitterIndex]._id;
            const artworkIndex = submitterIndex; // Grab one of their artworks

            if (challenge.status === "ACTIVE") {
                submissionsData.push({ 
                    submittedBy: submitterId, 
                    communityId: challenge.community, 
                    challengeId: challenge._id, 
                    content: artworks[artworkIndex]._id, 
                    mediaUrl: artworks[artworkIndex].image, 
                    description: "My active submission", 
                    status: "pending" 
                });
            } else if (challenge.status === "FINALIZED") {
                submissionsData.push({ 
                    submittedBy: submitterId, 
                    communityId: challenge.community, 
                    challengeId: challenge._id, 
                    content: artworks[artworkIndex]._id, 
                    mediaUrl: artworks[artworkIndex].image, 
                    description: "My past submission", 
                    status: "approved", 
                    pointsAwarded: challenge.maxPoints 
                });
                
                // Add a rejected submission from another user
                const rejectedSubmitterId = users[(submitterIndex + 1) % 15]._id;
                submissionsData.push({ 
                    submittedBy: rejectedSubmitterId, 
                    communityId: challenge.community, 
                    challengeId: challenge._id, 
                    content: artworks[(artworkIndex+1)%30]._id, 
                    mediaUrl: artworks[(artworkIndex+1)%30].image, 
                    description: "Bad submission", 
                    status: "rejected",
                    rejectionNote: "Not what we asked for."
                });
            }
        }

        const submissions = await Submission.insertMany(submissionsData);

        // Update points for users with approved submissions
        for(const sub of submissions) {
            if (sub.status === "approved") {
                const user = await User.findById(sub.submittedBy);
                user.points.global += sub.pointsAwarded;
                
                let commPoints = user.points.communities.get(sub.communityId.toString()) || 0;
                user.points.communities.set(sub.communityId.toString(), commPoints + sub.pointsAwarded);

                if (!user.completedChallenges.includes(sub.challengeId)) {
                    user.completedChallenges.push(sub.challengeId);
                }
                await user.save();
            }
        }

        console.log("Database seeded successfully!");
        console.log("Users created:");
        usersData.forEach(u => console.log(`- Username: ${u.username} | Email: ${u.email} | Password: password123`));

        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedData();
