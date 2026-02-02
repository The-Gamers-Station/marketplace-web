package com.thegamersstation.marketplace.otp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.thegamersstation.marketplace.common.exception.BusinessRuleException;
import com.thegamersstation.marketplace.common.exception.RateLimitExceededException;
import com.thegamersstation.marketplace.common.validation.PhoneValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@ConditionalOnProperty(name = "otp.isEnabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class SmsOtpService implements OtpService {

    private final OtpLogRepository otpLogRepository;
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${otp.sms.api-url}")
    private String apiUrl;

    @Value("${otp.sms.auth-token}")
    private String authToken;

    @Value("${otp.sms.sender}")
    private String sender;

    @Value("${otp.code-length}")
    private int codeLength;

    @Value("${otp.ttl-minutes}")
    private int ttlMinutes;

    @Value("${otp.resend-cooldown-seconds}")
    private int resendCooldownSeconds;

    @Value("${otp.max-attempts-per-day}")
    private int maxAttemptsPerDay;

    @Value("${rate-limit.otp.per-phone}")
    private int perPhoneRateLimit;

    @Value("${rate-limit.otp.per-ip}")
    private int perIpRateLimit;

    // In-memory cache for OTP codes (expires after TTL)
    private final Cache<String, String> otpCache = Caffeine.newBuilder()
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .maximumSize(10_000)
            .build();

    private final Random random = new Random();

    @Override
    public void sendOtp(String phoneNumber, String ipAddress, String language) {
        log.info("Sending OTP via SMS to phone: {} in language: {}", phoneNumber, language);

        // Validate phone format
        if (!PhoneValidator.isValid(phoneNumber)) {
            throw new BusinessRuleException(
                "Invalid phone number format",
                "صيغة رقم الهاتف غير صحيحة"
            );
        }

        // Validate rate limits and business rules
        validateOtpRequest(phoneNumber, ipAddress);

        // Generate OTP code
        String code = generateOtpCode();

        // Store in cache with phone as key
        otpCache.put(phoneNumber, code);

        // Send SMS via Taqnyat API
        boolean success = sendSms(phoneNumber, code, language);

        // Log the attempt
        OtpLog otpLog = OtpLog.builder()
                .phoneNumber(phoneNumber)
                .ipAddress(ipAddress)
                .success(success)
                .attemptedAt(Instant.now())
                .build();
        otpLogRepository.save(otpLog);

        if (!success) {
            throw new BusinessRuleException(
                "Failed to send OTP. Please try again.",
                "فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى."
            );
        }

        log.info("✅ OTP sent successfully to {} (expires in {} minutes)", phoneNumber, ttlMinutes);
    }

    @Override
    public boolean verifyOtp(String phoneNumber, String code) {
        log.info("Verifying OTP for phone: {}", phoneNumber);

        if (code == null || code.isBlank()) {
            return false;
        }

        String storedCode = otpCache.getIfPresent(phoneNumber);

        if (storedCode == null) {
            log.warn("No OTP found for phone: {} (expired or not sent)", phoneNumber);
            return false;
        }

        boolean isValid = storedCode.equals(code.trim());

        if (isValid) {
            // Remove OTP from cache after successful verification
            otpCache.invalidate(phoneNumber);
            log.info("✅ OTP verified successfully for phone: {}", phoneNumber);
        } else {
            log.warn("❌ Invalid OTP code for phone: {}", phoneNumber);
        }

        return isValid;
    }

    @Override
    public void validateOtpRequest(String phoneNumber, String ipAddress) {
        Instant now = Instant.now();

        // Check daily limit
        Instant oneDayAgo = now.minus(Duration.ofDays(1));
        long attemptsToday = otpLogRepository.countByPhoneNumberAndAttemptedAtAfter(
                phoneNumber, oneDayAgo
        );

        if (attemptsToday >= maxAttemptsPerDay) {
            throw new BusinessRuleException(
                    String.format("Maximum OTP attempts (%d) reached for today. Please try again tomorrow.", maxAttemptsPerDay),
                    String.format("تم بلوغ الحد الأقصى من محاولات رمز التحقق (%d) لليوم. يرجى المحاولة غداً.", maxAttemptsPerDay)
            );
        }

        // Check resend cooldown
        OtpLog lastAttempt = otpLogRepository.findLastAttempt(phoneNumber);
        if (lastAttempt != null) {
            long secondsSinceLastAttempt = Duration.between(lastAttempt.getAttemptedAt(), now).getSeconds();
            if (secondsSinceLastAttempt < resendCooldownSeconds) {
                long retryAfter = resendCooldownSeconds - secondsSinceLastAttempt;
                throw new RateLimitExceededException(
                        String.format("Please wait %d seconds before requesting another OTP", retryAfter),
                        retryAfter
                );
            }
        }

        // Check per-phone rate limit (per minute)
        Instant oneMinuteAgo = now.minus(Duration.ofMinutes(1));
        long attemptsLastMinute = otpLogRepository.countByPhoneNumberAndAttemptedAtAfter(
                phoneNumber, oneMinuteAgo
        );

        if (attemptsLastMinute >= perPhoneRateLimit) {
            throw new RateLimitExceededException(
                    "Too many OTP requests. Please try again in 1 minute.", 60L
            );
        }

        // Check per-IP rate limit (per minute)
        long ipAttemptsLastMinute = otpLogRepository.countByIpAddressAndAttemptedAtAfter(
                ipAddress, oneMinuteAgo
        );

        if (ipAttemptsLastMinute >= perIpRateLimit) {
            throw new RateLimitExceededException(
                    "Too many OTP requests from this IP. Please try again in 1 minute.", 60L
            );
        }
    }

    private String generateOtpCode() {
        int min = (int) Math.pow(10, codeLength - 1);
        int max = (int) Math.pow(10, codeLength) - 1;
        int code = random.nextInt(max - min + 1) + min;
        return String.valueOf(code);
    }

    private boolean sendSms(String phoneNumber, String code, String language) {
        try {
            // Format phone number for Saudi Arabia (remove +966 and use plain number)
            String formattedPhone = phoneNumber.replace("+", "");

            // Build message body based on language
            String messageBody;
            if ("en".equalsIgnoreCase(language)) {
                messageBody = String.format("Your verification code: %s  For login thegamersstation.com", code);
            } else {
                // Default to Arabic
                messageBody = String.format("رمز التحقق:%s لدخول منصة thegamersstation.com", code);
            }

            // Build request payload
            Map<String, Object> payload = Map.of(
                    "sender", sender,
                    "recipients", List.of(formattedPhone),
                    "body", messageBody
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);

            // Build HTTP request
            Request request = new Request.Builder()
                    .url(apiUrl)
                    .post(RequestBody.create(jsonPayload, MediaType.get("application/json")))
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Authorization", authToken)
                    .build();

            // Execute request
            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    log.info("SMS API response: {}", response.body().string());
                    return true;
                } else {
                    log.error("SMS API error: {} - {}", response.code(), response.body().string());
                    return false;
                }
            }

        } catch (IOException e) {
            log.error("Failed to send SMS", e);
            return false;
        }
    }
}
