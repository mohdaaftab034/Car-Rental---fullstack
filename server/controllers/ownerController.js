import imagekit from "../configs/imagekit.js";
import Booking from "../models/booking.js";
import Car from "../models/car.js";
import User from "../models/user.js";
import fs from "fs";


export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner" })
        res.json({ success: true, message: "Role changed to owner successfully" });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

//api to list car

export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/cars"
        })

        // For URL Generation, works for both images and videos
        var optimizeImagekitURL = imagekit.url({
            path: response.filePath,

            transformation: [
                { width: "1280" },
                { quality: "auto" },
                { format: "webp" }
            ]
        });

        const image = optimizeImagekitURL;
        await Car.create({
            ...car,
            owner: _id,
            image
        });

        res.json({ success: true, message: "Car added successfully" });

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id });
        res.json({ success: true, cars });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const toggleCarAvailability = async (req, res) => {
    try {
        const { carId } = req.body;
        const { _id } = req.user;
        const car = await Car.findById(carId);
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "You are not authorized to change this car's availability" });
        }
        car.isAvailable = !car.isAvailable;
        await car.save();
        res.json({ success: true, message: "Car availability toggled successfully" });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const deleteCar = async (req, res) => {
    try {
        const { carId } = req.body;
        const { _id } = req.user;
        const car = await Car.findById(carId);

        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "You are not authorized to delete this car" });
        }

        car.owner = null; // Remove owner reference
        car.isAvailable = false; // Set availability to false
        await car.save();

        res.json({ success: true, message: "Car deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getDashboardData = async (req, res) => {
    try {
        const {_id, role} = req.user;

        if (role !== "owner") {
            return res.json({ success: false, message: "You are not authorized to access this data" });
        }

        const cars = await Car.find({ owner: _id });
        const bookings = await Booking.find({ owner: _id }).populate("car").sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({owner: _id, status: "pending"})

        const completedBookings = await Booking.find({owner: _id, status: "completed"})

        const monthlyRevenue = bookings.slice().filter(booking => booking.status === "confirmed")
            .reduce((acc, booking) => acc + booking.price, 0);
        
        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue
        }

        res.json({ success: true, dashboardData });

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id) {
            return res.json({ success: false, message: "User not found" });
        }

        const imageFile = req.file;

        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/users"
        });
        var optimizeImagekitURL = imagekit.url({
           path: response.filePath,
            transformation: [{
                quality: "auto",
                width: '400',
                format: "webp"
            }]
        });

        const image = optimizeImagekitURL;

        const updatedUser = await User.findByIdAndUpdate(_id, { image });

        res.json({ success: true, message: "Image updated successfully" });

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}