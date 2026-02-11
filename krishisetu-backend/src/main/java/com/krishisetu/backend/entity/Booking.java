package com.krishisetu.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    // Can be null if booking is for a worker
    @ManyToOne
    @JoinColumn(name = "machinery_id")
    private Machinery machinery;

    // Can be null if booking is for machinery
    @ManyToOne
    @JoinColumn(name = "worker_profile_id")
    private WorkerProfile workerProfile;

    private LocalDate startDate;
    private LocalDate endDate;

    // For workers, we might book by hours
    private Integer hours;

    private Double amount;

    private String status; // PENDING, CONFIRMED, CANCELLED

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String paymentStatus; // PENDING, PAID, FAILED

    @JsonProperty("farmerName")
    public String getFarmerName() {
        return farmer != null ? farmer.getFirstName() + " " + farmer.getLastName() : "N/A";
    }

    @JsonProperty("totalAmount")
    public Double getTotalAmount() {
        return amount;
    }
}
