package com.thegamersstation.marketplace.otp;

import com.thegamersstation.marketplace.common.exception.BusinessRuleException;
import com.thegamersstation.marketplace.common.exception.RateLimitExceededException;
import com.thegamersstation.marketplace.common.validation.PhoneValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

import java.time.Duration;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Base class for OTP services containing shared validation, rate-limiting, and code generation logic.
 */
@Slf4j
public abstract class AbstractOtpService implements OtpService {

    protected final OtpLogRepository otpLogRepository;
    protected final SecureRandom random = new SecureRandom();

    @Value("${otp.code-length}")
    protected int codeLength;

    @Value("${otp.ttl-minutes}")
    protected int ttlMinutes;

    @Value("${otp.resend-cooldown-seconds}")
    protected int resendCooldownSeconds;

    @Value("${otp.max-attempts-per-day}")
    protected int maxAttemptsPerDay;

    @Value("${rate-limit.otp.per-phone}")
    protected int perPhoneRateLimit;

    @Value("${rate-limit.otp.per-ip}")
    protected int perIpRateLimit;

    @Value("${otp.max-verify-attempts}")
    protected int maxVerifyAttempts;

    protected AbstractOtpService(OtpLogRepository otpLogRepository) {
        this.otpLogRepository = otpLogRepository;
    }

    /**
     * Validate phone format before sending OTP.
     */
    protected void validatePhoneFormat(String phoneNumber) {
        if (!PhoneValidator.isValid(phoneNumber)) {
            throw new BusinessRuleException(
                "Invalid phone number format",
                "صيغة رقم الهاتف غير صحيحة"
            );
        }
    }

    /**
     * Generate a random OTP code of configured length.
     */
    protected String generateOtpCode() {
        int min = (int) Math.pow(10, codeLength - 1);
        int max = (int) Math.pow(10, codeLength) - 1;
        int code = random.nextInt(max - min + 1) + min;
        return String.valueOf(code);
    }

    /**
     * Build the OTP message body in the specified language.
     */
    protected String buildOtpMessage(String code, String language) {
        if ("en".equalsIgnoreCase(language)) {
            return String.format("Your verification code: %s  For login thegamersstation.com", code);
        }
        return String.format("رمز التحقق:%s لدخول منصة thegamersstation.com", code);
    }

    /**
     * Log an OTP attempt and store the code in the database.
     */
    protected OtpLog logOtpAttempt(String phoneNumber, String ipAddress, boolean success) {
        return logOtpAttempt(phoneNumber, ipAddress, success, null);
    }

    /**
     * Log an OTP attempt with code and expiry stored in the database.
     */
    protected OtpLog logOtpAttemptWithCode(String phoneNumber, String ipAddress, boolean success, String code) {
        return logOtpAttempt(phoneNumber, ipAddress, success, code);
    }

    private OtpLog logOtpAttempt(String phoneNumber, String ipAddress, boolean success, String code) {
        OtpLog otpLog = OtpLog.builder()
                .phoneNumber(phoneNumber)
                .ipAddress(ipAddress)
                .success(success)
                .attemptedAt(Instant.now())
                .code(code != null ? hashOtpCode(code) : null)
                .expiresAt(code != null ? Instant.now().plusSeconds(ttlMinutes * 60L) : null)
                .build();
        return otpLogRepository.save(otpLog);
    }

    /**
     * Verify an OTP code against the database.
     * Enforces a maximum number of verification attempts per OTP to prevent brute-force attacks.
     */
    protected boolean verifyOtpFromDb(String phoneNumber, String code) {
        if (code == null || code.isBlank()) {
            return false;
        }

        // Find the latest active (non-expired) OTP for this phone
        OtpLog activeOtp = otpLogRepository.findLatestActiveOtp(phoneNumber, Instant.now());
        if (activeOtp == null) {
            log.warn("No active OTP found for phone: {}", phoneNumber);
            return false;
        }

        // Check if max verification attempts exceeded
        if (activeOtp.getVerificationAttempts() >= maxVerifyAttempts) {
            // Invalidate the OTP
            activeOtp.setExpiresAt(Instant.now());
            otpLogRepository.save(activeOtp);
            log.warn("Max verification attempts ({}) exceeded for phone: {}. OTP invalidated.", maxVerifyAttempts, phoneNumber);
            throw new RateLimitExceededException(
                    "Too many incorrect attempts. Please request a new OTP.", (long) resendCooldownSeconds
            );
        }

        // Increment verification attempts
        activeOtp.setVerificationAttempts(activeOtp.getVerificationAttempts() + 1);

        // Check if code matches
        String hashedCode = hashOtpCode(code.trim());
        if (hashedCode.equals(activeOtp.getCode())) {
            // Invalidate the OTP after successful verification
            activeOtp.setExpiresAt(Instant.now());
            otpLogRepository.save(activeOtp);
            log.info("OTP verified successfully via DB for phone: {}", phoneNumber);
            return true;
        }

        // Wrong code — save the incremented attempt count
        otpLogRepository.save(activeOtp);

        // If this attempt hit the limit, invalidate immediately
        if (activeOtp.getVerificationAttempts() >= maxVerifyAttempts) {
            activeOtp.setExpiresAt(Instant.now());
            otpLogRepository.save(activeOtp);
            log.warn("Max verification attempts reached after failed try for phone: {}. OTP invalidated.", phoneNumber);
        }

        log.warn("Invalid OTP attempt ({}/{}) for phone: {}", activeOtp.getVerificationAttempts(), maxVerifyAttempts, phoneNumber);
        return false;
    }

    /**
     * Hash OTP code with SHA-256 for secure storage.
     */
    protected String hashOtpCode(String code) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(code.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
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
}
