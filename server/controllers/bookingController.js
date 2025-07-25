import Booking from "../models/booking.js"
import Car from "../models/car.js";


const checkAvailibility = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate }
    })
    return bookings.length === 0;
}

export const checkAvailibilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        const cars = await Car.find({ location, available: true });

        const availabilityChecks = cars.map(async (car) => {
            const isAvailable = await checkAvailibility(car._id, pickupDate, returnDate);
            return {
                ...car._doc,
                isAvailable
            };
        });

        const allCarsWithAvailability = await Promise.all(availabilityChecks);

        const availableCars = allCarsWithAvailability.filter(car => car.isAvailable === true);

        res.json({ success: true, availableCars });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate } = req.body;

        const isAvailable = await checkAvailibility(car, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Car is not available" });
        }
        const carData = await Car.findById(car);
        console.log(carData)
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
        const price = carData.pricePerDay * noOfDays;

        await Booking.create({
            car,
            user: _id,
            owner: carData.owner,
            pickupDate: picked,
            returnDate: returned,
            price,
        })
        res.json({ success: true, message: "Booking created successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ user: _id }).populate("car").sort({ createdAt: -1 });

        res.json({ success: true, bookings });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getOwnerBookings = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.json({ success: false, message: "You are not authorized to view owner bookings" });
        }
        const bookings = await Booking.find({ owner: req.user._id }).populate("car user").select("-user.password").sort({ createdAt: -1 });

        res.json({ success: true, bookings });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;

        const { bookingId, status } = req.body;

        const booking = await Booking.findById(bookingId);

        if (booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "You are not authorized to change this booking status" });
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Booking status updated successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}