package com.krishisetu.backend.repository;

import com.krishisetu.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByRazorpayOrderId(String razorpayOrderId);

    List<Booking> findByFarmerId(Long farmerId);

    List<Booking> findByMachineryOwnerId(Long ownerId);

    List<Booking> findByWorkerProfileWorkerId(Long workerId);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.endDate >= :today AND (b.status IN ('PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'COMPLETED') OR b.paymentStatus = 'PAID')")
    List<Booking> findActiveBookings(
            @org.springframework.data.repository.query.Param("today") java.time.LocalDate today);

    List<Booking> findByMachineryId(Long machineryId);
}
