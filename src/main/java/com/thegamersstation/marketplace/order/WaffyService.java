package com.thegamersstation.marketplace.order;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

/**
 * Service for integrating with Waffy escrow API
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WaffyService {
    
    @Value("${waffy.base-url}")
    private String baseUrl;
    
    @Value("${waffy.auth-url}")
    private String authUrl;
    
    @Value("${waffy.oauth.username}")
    private String oauthUsername;
    
    @Value("${waffy.oauth.password}")
    private String oauthPassword;
    
    @Value("${waffy.oauth.client-auth}")
    private String clientAuth;
    
    @Value("${waffy.admin-user-id}")
    private String adminUserId;
    
    private final RestClient restClient = RestClient.create();
    
    // Cache for access token
    private String cachedAccessToken;
    private long tokenExpiryTime = 0;
    
    /**
     * Get OAuth access token
     */
    private String getAccessToken() {
        // Check if cached token is still valid (with 5 minute buffer)
        if (cachedAccessToken != null && System.currentTimeMillis() < tokenExpiryTime - 300000) {
            return cachedAccessToken;
        }
        
        log.info("Fetching new Waffy OAuth token");
        
        try {
            // Build form-urlencoded body
            String requestBody = "grant_type=password&username=" + oauthUsername + "&password=" + oauthPassword;
            
            WaffyTokenResponse response = restClient.post()
                .uri(authUrl + "/oauth/token")
                .header("Authorization", clientAuth)
                .header("Accept", "application/json")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .body(requestBody)
                .retrieve()
                .body(WaffyTokenResponse.class);
            
            if (response != null && response.getAccessToken() != null) {
                cachedAccessToken = response.getAccessToken();
                // Set expiry time (default to 3600 seconds if not provided)
                int expiresIn = response.getExpiresIn() != null ? response.getExpiresIn() : 3600;
                tokenExpiryTime = System.currentTimeMillis() + (expiresIn * 1000L);
                
                log.info("Waffy OAuth token obtained successfully, expires in {} seconds", expiresIn);
                return cachedAccessToken;
            } else {
                throw new RuntimeException("Invalid token response from Waffy");
            }
        } catch (Exception e) {
            log.error("Error getting Waffy OAuth token", e);
            throw new RuntimeException("Failed to authenticate with Waffy: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create a contract with Waffy
     */
    public WaffyContractResponse createContract(String title, String description, BigDecimal amount) {
        log.info("Creating Waffy contract for: {}", title);
        
        WaffyCreateContractRequest request = new WaffyCreateContractRequest();
        request.setType("COMPLEX_CONTRACT");
        request.setSenderRole("PROVIDER");
        request.setItemDetail(new WaffyItemDetail(title, description));
        request.setReturnPolicy("NO_RETURN");
        request.setWaffyTermsAccepted(true);
        
        try {
            String accessToken = getAccessToken();
            
            WaffyApiResponse apiResponse = restClient.post()
                .uri(baseUrl + "/api/external/contracts")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(WaffyApiResponse.class);
            
            if (apiResponse == null || apiResponse.getData() == null) {
                throw new RuntimeException("Invalid response from Waffy API");
            }
            
            WaffyContractResponse response = new WaffyContractResponse();
            response.setContractId(apiResponse.getData().getId());
            response.setShortId(apiResponse.getData().getShortId());
            response.setStatus(apiResponse.getData().getStatus());
            
            log.info("Waffy contract created: {} (shortId: {})", response.getContractId(), response.getShortId());
            return response;
        } catch (Exception e) {
            log.error("Error creating Waffy contract", e);
            throw new RuntimeException("Failed to create Waffy contract: " + e.getMessage(), e);
        }
    }
    
    /**
     * Accept a contract
     */
    public void acceptContract(String contractId) {
        log.info("Accepting Waffy contract: {}", contractId);
        
        WaffyContractActionRequest request = new WaffyContractActionRequest();
        request.setContractId(contractId);
        request.setUserId(adminUserId);
        request.setActorRole("BROKER");
        request.setContractAction("ACCEPT_CONTRACT");
        request.setContractType("MILESTONE_CONTRACT");
        
        try {
            String accessToken = getAccessToken();
            
            restClient.post()
                .uri(baseUrl + "/contract-actions/external")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .toBodilessEntity();
            
            log.info("Waffy contract accepted: {}", contractId);
        } catch (Exception e) {
            log.error("Error accepting Waffy contract", e);
            throw new RuntimeException("Failed to accept Waffy contract: " + e.getMessage(), e);
        }
    }
    
    /**
     * Reject a contract
     */
    public void rejectContract(String contractId) {
        log.info("Rejecting Waffy contract: {}", contractId);
        
        WaffyContractActionRequest request = new WaffyContractActionRequest();
        request.setContractId(contractId);
        request.setUserId(adminUserId);
        request.setActorRole("BROKER");
        request.setContractAction("REJECT_CONTRACT");
        request.setContractType("MILESTONE_CONTRACT");
        
        try {
            String accessToken = getAccessToken();
            
            restClient.post()
                .uri(baseUrl + "/contract-actions/external")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .toBodilessEntity();
            
            log.info("Waffy contract rejected: {}", contractId);
        } catch (Exception e) {
            log.error("Error rejecting Waffy contract", e);
            throw new RuntimeException("Failed to reject Waffy contract: " + e.getMessage(), e);
        }
    }
    
    // Inner DTOs for Waffy API
    
    @Data
    public static class WaffyCreateContractRequest {
        private String type;
        private String senderRole;
        private WaffyItemDetail itemDetail;
        private String returnPolicy;
        private Boolean waffyTermsAccepted;
    }
    
    @Data
    public static class WaffyItemDetail {
        private String title;
        private String description;
        
        public WaffyItemDetail() {}
        
        public WaffyItemDetail(String title, String description) {
            this.title = title;
            this.description = description;
        }
    }
    
    @Data
    public static class WaffyContractActionRequest {
        private String contractId;
        private String userId;
        private String actorRole;
        private String contractAction;
        private String contractType;
    }
    
    @Data
    public static class WaffyContractResponse {
        private String contractId;
        private String shortId;
        private String status;
    }
    
    // Wrapper for Waffy API responses
    @Data
    public static class WaffyApiResponse {
        private Integer status;
        private String timestamp;
        private WaffyContractData data;
    }
    
    @Data
    public static class WaffyContractData {
        private String id;
        private String shortId;
        private String type;
        private String senderId;
        private String senderRole;
        private WaffyItemDetail itemDetail;
        private Double itemPrice;
        private Double totalAmount;
        private String currency;
        private String status;
        private String createdAt;
        private String contractClassification;
    }
    
    @Data
    public static class WaffyTokenResponse {
        private String accessToken;
        private String tokenType;
        private Integer expiresIn;
        private String scope;
    }
}
