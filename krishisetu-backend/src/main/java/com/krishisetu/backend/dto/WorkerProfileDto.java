package com.krishisetu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerProfileDto {
    private Long id;
    @NotNull(message = "Worker ID is required")
    private Long workerId;
    @NotBlank(message = "Worker name is required")
    @Size(min = 3, max = 50, message = "Worker name must be between 3 to 50 characters")
    private String workerName;
    @NotBlank(message = "Skills are required")
    private String skills;
    private int experienceYears;
    private double hourlyRate;
    @NotBlank(message = "Skills are required")
    private String availabilityStatus;
    private String bio;
    @FutureOrPresent(message = "Available date cannot be in the past")
    private LocalDate availableDate;
    private boolean isApproved;
}
