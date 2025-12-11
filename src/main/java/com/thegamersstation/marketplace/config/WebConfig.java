package com.thegamersstation.marketplace.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${media.storage.local.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files
        String uploadsPath = Paths.get(uploadDir).toAbsolutePath().toString();
        
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + uploadsPath + "/")
            .setCachePeriod(3600); // Cache for 1 hour
    }
}