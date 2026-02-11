package com.krishisetu.backend.controller;

import com.krishisetu.backend.dto.BookingRequest;
import com.krishisetu.backend.dto.PaymentVerificationRequest;
import com.krishisetu.backend.entity.Booking;
import com.krishisetu.backend.entity.User;
import com.krishisetu.backend.repository.UserRepository;
import com.krishisetu.backend.service.BookingService;
import com.krishisetu.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    // 1. Farmer creates booking request
    @PostMapping("/farmer/bookings/create")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                    .getPrincipal();
            User farmer = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Booking booking = bookingService.createBooking(
                    farmer.getId(),
                    request.getMachineryId(),
                    request.getWorkerProfileId(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getHours());

            return ResponseEntity.ok(Map.of("message", "Booking requested successfully. Waiting for owner approval."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Owner views booking requests
    @GetMapping("/owner/bookings")
    @PreAuthorize("hasAnyRole('OWNER', 'WORKER')")
    public ResponseEntity<?> getOwnerBookings() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                    .getPrincipal();
            List<Booking> bookings = bookingService.getBookingsForOwner(userDetails.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Owner approves/rejects booking
    @PutMapping("/owner/bookings/{bookingId}/{status}")
    @PreAuthorize("hasAnyRole('OWNER', 'WORKER')")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long bookingId, @PathVariable String status) {
        try {
            // Validate status
            if (!status.equals("APPROVED") && !status.equals("REJECTED")) {
                return ResponseEntity.badRequest().body("Invalid status");
            }
            Booking booking = bookingService.updateBookingStatus(bookingId, status);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Farmer initiates payment for APPROVED booking
    @PostMapping("/farmer/bookings/{bookingId}/pay")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<?> initiatePayment(@PathVariable Long bookingId) {
        try {
            Map<String, Object> response = bookingService.initiatePayment(bookingId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 5. Verify payment
    @PostMapping("/farmer/bookings/verify")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<?> verifyBooking(@RequestBody PaymentVerificationRequest request) {
        try {
            bookingService.verifyPayment(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature());
            return ResponseEntity.ok(Map.of("message", "Booking confirmed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 6. Get Farmer Bookings History
    @GetMapping("/farmer/bookings/history")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<?> getFarmerBookings() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                    .getPrincipal();
            List<Booking> bookings = bookingService.getFarmerBookings(userDetails.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 7. Update Booking Date
    @PutMapping("/owner/bookings/{bookingId}/date")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> updateBookingDate(@PathVariable Long bookingId, @RequestBody Map<String, String> request) {
        try {
            LocalDate startDate = LocalDate.parse(request.get("startDate"));
            LocalDate endDate = LocalDate.parse(request.get("endDate"));
            Booking booking = bookingService.updateBookingDate(bookingId, startDate, endDate);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
