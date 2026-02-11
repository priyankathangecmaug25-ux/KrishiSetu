package com.krishisetu.backend.controller;

import com.krishisetu.backend.dto.WorkerProfileDto;
import com.krishisetu.backend.entity.WorkerProfile;
import com.krishisetu.backend.repository.MachineryRepository;
import com.krishisetu.backend.repository.WorkerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/farmer")
public class FarmerController {

        @Autowired
        private MachineryRepository machineryRepository;

        @Autowired
        private WorkerProfileRepository workerProfileRepository;

        @Autowired
        private com.krishisetu.backend.repository.BookingRepository bookingRepository;

        @GetMapping("/machinery/search")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<?> searchMachinery() {
                List<com.krishisetu.backend.entity.Machinery> allMachinery = machineryRepository
                                .findByApprovedTrueAndDeletedFalse();

                // Filter out machinery that is currently booked (APPROVED or CONFIRMED)
                List<com.krishisetu.backend.entity.Booking> activeBookings = bookingRepository
                                .findActiveBookings(java.time.LocalDate.now());
                java.util.Set<Long> bookedMachineryIds = activeBookings.stream()
                                .map(b -> b.getMachinery() != null ? b.getMachinery().getId() : null)
                                .filter(java.util.Objects::nonNull)
                                .collect(Collectors.toSet());

                List<com.krishisetu.backend.entity.Machinery> availableMachinery = allMachinery.stream()
                                .filter(m -> !bookedMachineryIds.contains(m.getId()))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(availableMachinery);
        }

        @GetMapping("/workers/search")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<?> searchWorkers() {
                List<WorkerProfile> profiles = workerProfileRepository.findByIsApprovedTrue();

                // Get all active future bookings
                List<com.krishisetu.backend.entity.Booking> activeBookings = bookingRepository
                                .findActiveBookings(java.time.LocalDate.now());

                // Map workerId -> List of their bookings
                java.util.Map<Long, List<com.krishisetu.backend.entity.Booking>> workerBookingsMap = activeBookings
                                .stream()
                                .filter(b -> b.getWorkerProfile() != null)
                                .collect(Collectors.groupingBy(b -> b.getWorkerProfile().getId()));

                List<WorkerProfileDto> dtos = profiles.stream()
                                .filter(wp -> {
                                        // If no available date set, assume visible (or handle as per requirement)
                                        if (wp.getAvailableDate() == null)
                                                return true;

                                        List<com.krishisetu.backend.entity.Booking> bookings = workerBookingsMap
                                                        .get(wp.getId());
                                        // If no bookings, visible
                                        if (bookings == null || bookings.isEmpty())
                                                return true;

                                        // Check if availableDate falls within any booking range
                                        for (com.krishisetu.backend.entity.Booking b : bookings) {
                                                if (!wp.getAvailableDate().isBefore(b.getStartDate()) &&
                                                                !wp.getAvailableDate().isAfter(b.getEndDate())) {
                                                        return false; // Booked on this date
                                                }
                                        }
                                        return true; // Not booked on this specific date
                                })
                                .map(wp -> new WorkerProfileDto(
                                                wp.getId(),
                                                wp.getWorker().getId(),
                                                wp.getWorker().getFirstName() + " " + wp.getWorker().getLastName(),
                                                wp.getSkills(),
                                                wp.getExperienceYears(),
                                                wp.getHourlyRate(),
                                                wp.getAvailabilityStatus(),
                                                wp.getBio(),
                                                wp.getAvailableDate(),
                                                wp.isApproved()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
        }
}
