package com.thegamersstation.marketplace.auth;

import com.thegamersstation.marketplace.auth.dto.OtpRequestDto;
import com.thegamersstation.marketplace.auth.dto.OtpVerifyDto;
import com.thegamersstation.marketplace.common.exception.BusinessRuleException;
import com.thegamersstation.marketplace.otp.FixedAdminOtpService;
import com.thegamersstation.marketplace.otp.OtpService;
import com.thegamersstation.marketplace.security.JwtUtil;
import com.thegamersstation.marketplace.user.repository.User;
import com.thegamersstation.marketplace.user.repository.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceFixedAdminTests {

    private static final String PHONE = "+966500000000";
    private final OtpService sms = mock(OtpService.class);
    private final FixedAdminOtpService fixed = mock(FixedAdminOtpService.class);
    private final UsersRepository users = mock(UsersRepository.class);
    private final JwtUtil jwt = mock(JwtUtil.class);
    private final RefreshTokenRepository refreshTokens = mock(RefreshTokenRepository.class);
    private AuthService auth;

    @BeforeEach
    void setUp() {
        auth = new AuthService(sms, fixed, users, jwt, refreshTokens);
        ReflectionTestUtils.setField(auth, "otpTtlMinutes", 5);
        ReflectionTestUtils.setField(auth, "resendCooldownSeconds", 60);
    }

    private OtpRequestDto request(String phone) {
        OtpRequestDto dto = new OtpRequestDto();
        dto.setPhoneNumber(phone);
        return dto;
    }

    private OtpVerifyDto verification(String phone) {
        OtpVerifyDto dto = new OtpVerifyDto();
        dto.setPhoneNumber(phone);
        dto.setCode("8642");
        return dto;
    }

    private User admin() {
        return User.builder().id(1L).phoneNumber(PHONE).role(User.UserRole.ADMIN)
                .isActive(true).profileCompleted(true).build();
    }

    private void tokenResponses(User user) {
        when(jwt.generateAccessToken(user.getId(), user.getPhoneNumber(), user.getRole().name())).thenReturn("test-access-token");
        when(jwt.generateRefreshToken(user.getId())).thenReturn("test-refresh-token");
        when(jwt.extractJti("test-refresh-token")).thenReturn("test-refresh-id");
        when(jwt.extractExpiration("test-refresh-token")).thenReturn(Date.from(Instant.now().plusSeconds(3600)));
        when(jwt.getAccessTokenExpiration()).thenReturn(900000L);
    }

    @Test
    void normalizesAdminPhoneAndSkipsSmsWhilePreservingFrontendTiming() {
        when(fixed.handles(PHONE)).thenReturn(true);
        var response = auth.requestOtp(request("0500000000"), "127.0.0.1", "en");
        assertEquals(300, response.getExpiresIn());
        assertEquals(60, response.getResendAfter());
        assertEquals("Verification challenge created", response.getMessage());
        verify(fixed).requestChallenge(PHONE, "127.0.0.1");
        verifyNoInteractions(sms);
    }

    @Test
    void ordinaryNumbersStillUseSms() {
        auth.requestOtp(request("+966501234567"), "127.0.0.1", "ar");
        verify(sms).sendOtp("+966501234567", "127.0.0.1", "ar");
        verify(fixed, never()).requestChallenge(anyString(), anyString());
    }

    @Test
    void disabledExceptionUsesNormalSmsEvenForTheDesignatedPhone() {
        var response = auth.requestOtp(request(PHONE), "127.0.0.1", "en");
        assertEquals("OTP sent successfully", response.getMessage());
        verify(sms).sendOtp(PHONE, "127.0.0.1", "en");
    }

    @Test
    void fixedVerificationNeverFallsBackToSmsOrDevAllowlist() {
        when(fixed.handles(PHONE)).thenReturn(true);
        when(fixed.verifyChallenge(PHONE, "8642")).thenReturn(false);
        assertThrows(BusinessRuleException.class, () -> auth.verifyOtp(verification(PHONE)));
        verifyNoInteractions(sms, users, jwt, refreshTokens);
    }

    @Test
    void validFixedChallengeUsesExistingTokenAndRefreshSessionFlow() {
        User user = admin();
        when(fixed.handles(PHONE)).thenReturn(true);
        when(fixed.verifyChallenge(PHONE, "8642")).thenReturn(true);
        when(users.findByPhoneNumber(PHONE)).thenReturn(Optional.of(user));
        tokenResponses(user);
        var response = auth.verifyOtp(verification(PHONE));
        assertEquals("ADMIN", response.getRole());
        assertEquals(user.getId(), response.getUserId());
        assertEquals("test-access-token", response.getAccessToken());
        verify(refreshTokens).save(argThat(token -> token.getUserId().equals(user.getId())
                && token.getTokenHash().length() == 64 && token.getTokenFamily() != null));
        verify(users, never()).save(any());
        verifyNoInteractions(sms);
    }

    @Test
    void missingAdminCannotBeAutoCreatedAfterChallengeVerification() {
        when(fixed.handles(PHONE)).thenReturn(true);
        when(fixed.verifyChallenge(PHONE, "8642")).thenReturn(true);
        when(users.findByPhoneNumber(PHONE)).thenReturn(Optional.empty());
        assertThrows(BusinessRuleException.class, () -> auth.verifyOtp(verification(PHONE)));
        verify(users, never()).save(any());
        verifyNoInteractions(jwt, refreshTokens);
    }

    @Test
    void roleAndActivityAreRecheckedBeforeIssuingTokens() {
        when(fixed.handles(PHONE)).thenReturn(true);
        when(fixed.verifyChallenge(PHONE, "8642")).thenReturn(true);
        User user = admin();
        user.setRole(User.UserRole.USER);
        when(users.findByPhoneNumber(PHONE)).thenReturn(Optional.of(user));
        assertThrows(BusinessRuleException.class, () -> auth.verifyOtp(verification(PHONE)));
        user.setRole(User.UserRole.ADMIN);
        user.setIsActive(false);
        assertThrows(BusinessRuleException.class, () -> auth.verifyOtp(verification(PHONE)));
        verifyNoInteractions(jwt, refreshTokens);
    }

    @Test
    void ordinarySmsVerificationAndTokenIssuanceRemainUnchanged() {
        String phone = "+966501234567";
        User user = User.builder().id(2L).phoneNumber(phone).role(User.UserRole.USER)
                .isActive(true).profileCompleted(true).build();
        when(sms.verifyOtp(phone, "8642")).thenReturn(true);
        when(users.findByPhoneNumber(phone)).thenReturn(Optional.of(user));
        tokenResponses(user);
        assertEquals("USER", auth.verifyOtp(verification(phone)).getRole());
        verify(fixed, never()).verifyChallenge(anyString(), anyString());
    }
}
