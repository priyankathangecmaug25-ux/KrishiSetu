package com.krishisetu.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {
    private Long machineryId;
    private Long workerProfileId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer hours;
}
