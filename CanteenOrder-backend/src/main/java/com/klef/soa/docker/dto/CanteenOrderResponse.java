
package com.klef.soa.docker.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanteenOrderResponse {

    private Long id;
    private String orderCode;
    private Integer itemCount;
    private Double totalCost;
    private String pickupStatus;
}
