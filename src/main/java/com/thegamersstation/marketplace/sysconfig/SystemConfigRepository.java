package com.thegamersstation.marketplace.sysconfig;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for SystemConfig entity
 */
@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
    
    /**
     * Find all configs by category
     */
    List<SystemConfig> findByCategory(SystemConfig.ConfigCategory category);
    
    /**
     * Find all editable configs
     */
    List<SystemConfig> findByIsEditableTrue();
    
    /**
     * Check if a config key exists
     */
    boolean existsByConfigKey(String configKey);
}
