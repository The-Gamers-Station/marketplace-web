package com.thegamersstation.marketplace.otp;

import com.thegamersstation.marketplace.common.exception.BusinessRuleException;
import com.thegamersstation.marketplace.common.exception.RateLimitExceededException;
import com.thegamersstation.marketplace.user.repository.User;
import com.thegamersstation.marketplace.user.repository.UsersRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

/**
 * Explicitly configured exception for one existing admin account.
 * Each login still requires an unexpired, attempt-limited, single-use challenge.
 */
@Service
public class FixedAdminOtpService {

    private static final String ADMIN_PHONE = "+966500000000";

    private final OtpService otpService;
    private final OtpLogRepository otpLogRepository;
    private final UsersRepository usersRepository;
    private final TransactionTemplate transaction;

    @Value("${otp.fixed-admin.enabled:false}")
    private boolean enabled;

    @Value("${otp.fixed-admin.code:}")
    private String configuredCode;

    @Value("${otp.ttl-minutes}")
    private int ttlMinutes;

    @Value("${otp.resend-cooldown-seconds}")
    private int resendCooldownSeconds;

    @Value("${otp.max-verify-attempts}")
    private int maxVerifyAttempts;

    public FixedAdminOtpService(OtpService otpService, OtpLogRepository otpLogRepository,
                                UsersRepository usersRepository, PlatformTransactionManager transactionManager) {
        this.otpService = otpService;
        this.otpLogRepository = otpLogRepository;
        this.usersRepository = usersRepository;
        this.transaction = new TransactionTemplate(transactionManager);
        // Login rejection must not roll back the persisted verification-attempt counter.
        this.transaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @PostConstruct
    void validateConfiguration() {
        if (enabled && (configuredCode == null || !configuredCode.matches("[0-9]{4}"))) {
            throw new IllegalStateException("Enabled fixed admin login requires a four-digit backend code.");
        }
        if (enabled && (ttlMinutes < 1 || resendCooldownSeconds < 1 || maxVerifyAttempts < 1)) {
            throw new IllegalStateException("Fixed admin login requires positive expiry, cooldown and attempt limits.");
        }
    }

    public boolean handles(String normalizedPhone) {
        return enabled && ADMIN_PHONE.equals(normalizedPhone);
    }

    public void requestChallenge(String normalizedPhone, String ipAddress) {
        requireHandledPhone(normalizedPhone);
        transaction.executeWithoutResult(status -> {
            requireActiveAdmin(normalizedPhone);
            otpService.validateOtpRequest(normalizedPhone, ipAddress);

            // Whole seconds are preserved even by legacy MySQL TIMESTAMP columns.
            Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
            otpLogRepository.expireActiveOtps(normalizedPhone, now);
            OtpLog challenge = OtpLog.builder()
                    .phoneNumber(normalizedPhone)
                    .ipAddress(ipAddress)
                    .attemptedAt(now)
                    .expiresAt(now.plusSeconds(ttlMinutes * 60L))
                    .verificationAttempts(0)
                    .success(true)
                    .build();
            // Domain separation prevents a normal SMS/dev OTP from satisfying this path.
            challenge.setCode(challengeHash(challenge, configuredCode));
            otpLogRepository.save(challenge);
        });
    }

    public boolean verifyChallenge(String normalizedPhone, String submittedCode) {
        requireHandledPhone(normalizedPhone);
        Verification result = transaction.execute(status -> {
            // All requests/verifications for this account take the same database row lock.
            requireActiveAdmin(normalizedPhone);
            Instant now = Instant.now();
            OtpLog challenge = otpLogRepository.findLatestActiveOtp(normalizedPhone, now);
            if (challenge == null || challenge.getExpiresAt() == null || !challenge.getExpiresAt().isAfter(now)
                    || challenge.getAttemptedAt() == null || !Boolean.TRUE.equals(challenge.getSuccess())) {
                return Verification.INVALID;
            }
            int attempts = challenge.getVerificationAttempts() == null ? 0 : challenge.getVerificationAttempts();
            if (attempts >= maxVerifyAttempts) {
                challenge.setExpiresAt(now);
                otpLogRepository.save(challenge);
                return Verification.LIMIT;
            }

            challenge.setVerificationAttempts(attempts + 1);
            String candidate = submittedCode == null ? "" : submittedCode.trim();
            boolean valid = candidate.matches("[0-9]{4}")
                    && constantTimeEquals(challenge.getCode(), challengeHash(challenge, configuredCode))
                    && constantTimeEquals(challenge.getCode(), challengeHash(challenge, candidate));
            if (valid || attempts + 1 >= maxVerifyAttempts) {
                challenge.setExpiresAt(now);
            }
            otpLogRepository.save(challenge);
            return valid ? Verification.VALID
                    : attempts + 1 >= maxVerifyAttempts ? Verification.LIMIT : Verification.INVALID;
        });
        if (result == Verification.LIMIT) {
            // Throw only after the new transaction commits the attempt/expiry changes.
            throw new RateLimitExceededException(
                    "Too many incorrect attempts. Please request a new OTP.", (long) resendCooldownSeconds);
        }
        return result == Verification.VALID;
    }

    private void requireHandledPhone(String phone) {
        if (!handles(phone)) {
            throw new BusinessRuleException("Invalid verification request", "طلب التحقق غير صالح");
        }
    }

    private void requireActiveAdmin(String phone) {
        User user = usersRepository.findForOtpByPhoneNumber(phone)
                .orElseThrow(() -> new BusinessRuleException("Invalid verification request", "طلب التحقق غير صالح"));
        if (user.getRole() != User.UserRole.ADMIN || !Boolean.TRUE.equals(user.getIsActive())) {
            throw new BusinessRuleException("Invalid verification request", "طلب التحقق غير صالح");
        }
    }

    private String challengeHash(OtpLog challenge, String code) {
        String input = "fixed-admin:" + challenge.getPhoneNumber() + ":" + challenge.getAttemptedAt().getEpochSecond()
                + ":" + code;
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException("SHA-256 is not available", error);
        }
    }

    private boolean constantTimeEquals(String stored, String candidate) {
        return stored != null && MessageDigest.isEqual(
                stored.getBytes(StandardCharsets.UTF_8), candidate.getBytes(StandardCharsets.UTF_8));
    }

    private enum Verification { VALID, INVALID, LIMIT }
}
