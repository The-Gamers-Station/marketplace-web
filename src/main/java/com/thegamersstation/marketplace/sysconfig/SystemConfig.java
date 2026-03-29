package com.thegamersstation.marketplace.sysconfig;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entity representing system-wide configuration
 */
@Entity
@Table(name = "system_config")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {
    
    @Id
    @Column(name = "config_key", length = 100)
    private String configKey;
    
    @Column(name = "config_value", columnDefinition = "TEXT", nullable = false)
    private String configValue;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "value_type", length = 50, nullable = false)
    private ValueType valueType = ValueType.STRING;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "is_editable", nullable = false)
    private Boolean isEditable = true;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50, nullable = false)
    private ConfigCategory category = ConfigCategory.GENERAL;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum ValueType {
        STRING,
        INTEGER,
        DECIMAL,
        BOOLEAN,
        JSON
    }
    
    public enum ConfigCategory {
        GENERAL,
        SHIPPING,
        PAYMENT,
        ORDER,
        PRODUCT,
        USER,
        NOTIFICATION
    }
}
