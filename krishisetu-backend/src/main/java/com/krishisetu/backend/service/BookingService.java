package com.krishisetu.backend.service;

import com.krishisetu.backend.entity.*;
import com.krishisetu.backend.repository.*;
import com.razorpay.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private MachineryRepository machineryRepository;
    @Autowired
    private WorkerProfileRepository workerProfileRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RazorpayService razorpayService;

    // 1. Create Booking (Pending Approval)
    public Booking createBooking(Long farmerId, Long machineryId, Long workerProfileId, LocalDate startDate,
            LocalDate endDate, Integer hours) throws Exception {
        User farmer = userRepository.findById(farmerId).orElseThrow(() -> new RuntimeException("Farmer not found"));

        Booking booking = new Booking();
        booking.setFarmer(farmer);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setHours(hours);
        booking.setStatus("PENDING_APPROVAL"); // Changed from PENDING
        booking.setPaymentStatus("PENDING");

        double amount = 0.0;

        if (machineryId != null) {
            Machinery machinery = machineryRepository.findById(machineryId)
                    .orElseThrow(() -> new RuntimeException("Machinery not found"));
            booking.setMachinery(machinery);
            if (startDate != null && endDate != null) {
                long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
                amount = machinery.getRatePerDay() * days;
            } else {
                amount = machinery.getRatePerDay();
            }
        } else if (workerProfileId != null) {
            WorkerProfile worker = workerProfileRepository.findById(workerProfileId)
                    .orElseThrow(() -> new RuntimeException("Worker not found"));
            booking.setWorkerProfile(worker);
            amount = worker.getHourlyRate() * (hours != null ? hours : 8);
        } else {
            throw new RuntimeException("Invalid booking request");
        }

        booking.setAmount(amount);
        return bookingRepository.save(booking); // No Razorpay order here
    }

    // 2. Initialise Payment (After Approval)
    public Map<String, Object> initiatePayment(Long bookingId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"APPROVED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is not approved by the owner.");
        }

        if ("PAID".equals(booking.getPaymentStatus())) {
            throw new RuntimeException("Booking is already paid.");
        }

        // Create Razorpay Order if not already created
        if (booking.getRazorpayOrderId() == null) {
            Order order = razorpayService.createOrder(booking.getAmount(), "INR", "booking_" + booking.getId());
            booking.setRazorpayOrderId(order.get("id"));
            bookingRepository.save(booking);
        }

        return Map.of(
                "orderId", booking.getRazorpayOrderId(),
                "amount", booking.getAmount(),
                "currency", "INR",
                "keyId", razorpayService.getKeyId());
    }

    // 3. Verify Payment
    public void verifyPayment(String razorpayOrderId, String razorpayPaymentId, String signature) throws Exception {
        boolean valid = razorpayService.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (valid) {
            Booking booking = bookingRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            booking.setPaymentStatus("PAID");
            booking.setStatus("COMPLETED");
            booking.setRazorpayPaymentId(razorpayPaymentId);
            bookingRepository.save(booking);
        } else {
            throw new RuntimeException("Payment verification failed");
        }
    }

    // 4. Get Owner Bookings
    public List<Booking> getBookingsForOwner(Long ownerId) {
        // Fetch bookings for both Machinery and Worker profiles belonging to this user
        List<Booking> machineryBookings = bookingRepository.findByMachineryOwnerId(ownerId);
        List<Booking> workerBookings = bookingRepository.findByWorkerProfileWorkerId(ownerId);

        machineryBookings.addAll(workerBookings);
        return machineryBookings;
    }

    // 5. Update Status (Approve/Reject)
    public Booking updateBookingStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        if ("REJECTED".equals(status)) {
            // Optional: Handle rejection specific logic
        }
        return bookingRepository.save(booking);
    }

    // 6. Update Booking Date (For Machinery Owner)
    public Booking updateBookingDate(Long bookingId, LocalDate startDate, LocalDate endDate) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Update dates
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);

        // Recalculate amount
        if (booking.getMachinery() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
            double newAmount = booking.getMachinery().getRatePerDay() * days;
            booking.setAmount(newAmount);
        }

        return bookingRepository.save(booking);
    }

    public String getRazorpayKeyId() {
        return razorpayService.getKeyId();
    }

    public List<Booking> getFarmerBookings(Long farmerId) {
        return bookingRepository.findByFarmerId(farmerId);
    }
}
