package com.thegamersstation.marketplace.sysconfig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for system configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfigDto {
    private String key;
    private String value;
    private String valueType;
    private String description;
    private String category;
    private Boolean isEditable;
}
