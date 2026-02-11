package com.krishisetu.backend.controller;

import com.krishisetu.backend.service.WorkerService;
import com.krishisetu.backend.dto.UpdateWorkerProfileDto;
import com.krishisetu.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.krishisetu.backend.entity.Booking;
import com.krishisetu.backend.service.BookingService;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/worker")
public class WorkerController {

    @Autowired
    private WorkerService workerService;

    @Autowired
    private BookingService bookingService;

    @GetMapping("/profile/mine")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> getMyProfile() {
       
        return ResponseEntity.ok(workerService.getProfileByUserId(getCurrentUserId()));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateWorkerProfileDto dto) {
        boolean success = workerService.updateProfile(getCurrentUserId(), dto);
        if (!success)
            return ResponseEntity.badRequest().body("Profile not found");
        return ResponseEntity.ok("Profile updated successfully");
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> getWorkerBookings() {
        Long workerId = getCurrentUserId();
        if (workerId == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        List<Booking> bookings = bookingService.getBookingsForOwner(workerId);
        return ResponseEntity.ok(bookings);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) auth.getPrincipal()).getId();
        }
        return null;
    }
}
