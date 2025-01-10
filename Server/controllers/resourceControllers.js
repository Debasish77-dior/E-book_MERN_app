import resourceModel from "../models/resource.js";
import userModel from "../models/userModel.js"; // Updated import
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Add resource --admin
export const addResource = async (req, res) => {
    try {
        // Extract the token from the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header is missing. Please log in again." });
        }

        // Token should be in the format "Bearer <token>"
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Authorization token is missing. Please log in again." });
        }

        // Verify and decode the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        // Find the user
        const user = await userModel.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "You are not authorized to add resources" });
        }

        // Check for duplicate resource
        const existingResource = await resourceModel.findOne({ url: req.body.link });
        if (existingResource) {
            return res.status(400).json({ message: "This resource already exists" });
        }

        // Add the resource
        const resource = new resourceModel({
            url: req.body.link,
            title: req.body.title,
            desc: req.body.desc,
            author: req.body.author,
            category: req.body.category,
            type: req.body.type,
            image: req.body.image,
        });

        await resource.save();
        res.status(200).json({ message: "Resource added successfully" });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token. Please log in again." });
        }
        res.status(500).json({ message: error.message });
    }
};

// Update resources --admin

export const updateResource = async (req, res) => {
    try {
        // Extract the token from the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header is missing. Please log in again." });
        }

        // Token should be in the format "Bearer <token>"
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Authorization token is missing. Please log in again." });
        }

        // Verify and decode the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        // Find the user
        const user = await userModel.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "You are not authorized to update resources" });
        }

        // Extract the resource ID from the headers
        const resourceId = req.headers["resource-id"];
        if (!resourceId || !mongoose.Types.ObjectId.isValid(resourceId)) {
            return res.status(400).json({ message: "Invalid Resource ID" });
        }

        // Find the resource to update
        const resource = await resourceModel.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        // Update only specific fields, keeping `url` constant
        const updatedData = {
            title: req.body.title || resource.title,
            description: req.body.desc || resource.description,
            author: req.body.author || resource.author,
            category: req.body.category || resource.category,
            type: req.body.type || resource.type,
            image: req.body.image || resource.image,
        };

        // Save the updated resource
        const updatedResource = await resourceModel.findByIdAndUpdate(
            resourceId,
            updatedData,
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: "Resource updated successfully", updatedResource });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token. Please log in again." });
        }
        res.status(500).json({ message: error.message });
    }
};

// Delete resource --admin
export const deleteResource = async (req, res) => {
    try {
        // Extract the token from the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header is missing. Please log in again." });
        }

        // Token should be in the format "Bearer <token>"
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Authorization token is missing. Please log in again." });
        }

        // Verify and decode the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        // Find the user
        const user = await userModel.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete resources" });
        }

        // Extract the resource ID from the headers
        const resourceId = req.headers["resource-id"];
        if (!resourceId || !mongoose.Types.ObjectId.isValid(resourceId)) {
            return res.status(400).json({ message: "Invalid Resource ID" });
        }

        // Find the resource to delete
        const resource = await resourceModel.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        // Delete the resource
        await resourceModel.findByIdAndDelete(resourceId);

        res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token. Please log in again." });
        }
        res.status(500).json({ message: error.message });
    }
};


//get all books
export const getAllResource = async (req, res) => {
    try {
        // Fetch all resources sorted by creation date in descending order
        const resources = await resourceModel.find().sort({ createdAt: -1 });

        return res.json({
            status: "Success",
            data: resources,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get recently added resources
export const getRecentlyAddedResources = async (req, res) => {
    try {
        // Fetch the 5 most recently added resources
        const resources = await resourceModel
            .find()
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .limit(5); // Limit the results to 5

        return res.json({
            status: "Success",
            data: resources,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



// Get resource by ID
export const getResourceById = async (req, res) => {
    try {
        // Extract the resource ID from the request parameters
        const { id } = req.params;

        // Validate the ID
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Resource ID" });
        }

        // Find the resource by ID
        const resource = await resourceModel.findById(id);

        // Check if the resource exists
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        // Return the resource
        return res.json({
            status: "Success",
            data: resource,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
