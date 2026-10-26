
package com.klef.soa.docker.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Data
public class CanteenOrderRequest {

    @NotBlank(message = "Order code is required")
    @Size(max = 50, message = "Order code cannot exceed 50 characters")
    private String orderCode;

    @NotNull(message = "Item count is required")
    @Positive(message = "Item count must be greater than zero")
    private Integer itemCount;

    @NotNull(message = "Total cost is required")
    @PositiveOrZero(message = "Total cost cannot be negative")
    private Double totalCost;

    @NotBlank(message = "Pickup status is required")
    private String pickupStatus;
}
