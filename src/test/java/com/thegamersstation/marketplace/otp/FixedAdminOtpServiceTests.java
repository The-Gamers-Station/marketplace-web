package com.thegamersstation.marketplace.otp;

import com.thegamersstation.marketplace.common.exception.BusinessRuleException;
import com.thegamersstation.marketplace.common.exception.RateLimitExceededException;
import com.thegamersstation.marketplace.user.repository.User;
import com.thegamersstation.marketplace.user.repository.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class FixedAdminOtpServiceTests {

    private static final String PHONE = "+966500000000";
    // Synthetic test fixture, unrelated to the deployment's configured code.
    private static final String TEST_CODE = "8642";

    private final OtpService sms = mock(OtpService.class);
    private final OtpLogRepository logs = mock(OtpLogRepository.class);
    private final UsersRepository users = mock(UsersRepository.class);
    private final PlatformTransactionManager manager = mock(PlatformTransactionManager.class);
    private final TransactionStatus transactionStatus = mock(TransactionStatus.class);
    private final AtomicReference<OtpLog> saved = new AtomicReference<>();
    private FixedAdminOtpService service;

    @BeforeEach
    void setUp() {
        service = new FixedAdminOtpService(sms, logs, users, manager);
        ReflectionTestUtils.setField(service, "enabled", true);
        ReflectionTestUtils.setField(service, "configuredCode", TEST_CODE);
        ReflectionTestUtils.setField(service, "ttlMinutes", 5);
        ReflectionTestUtils.setField(service, "resendCooldownSeconds", 60);
        ReflectionTestUtils.setField(service, "maxVerifyAttempts", 5);
        when(manager.getTransaction(any())).thenReturn(transactionStatus);
        when(users.findForOtpByPhoneNumber(PHONE)).thenReturn(Optional.of(
                User.builder().id(1L).phoneNumber(PHONE).role(User.UserRole.ADMIN).isActive(true).build()));
        when(logs.save(any(OtpLog.class))).thenAnswer(invocation -> {
            OtpLog log = invocation.getArgument(0);
            saved.set(log);
            return log;
        });
        when(logs.findLatestActiveOtp(eq(PHONE), any())).thenAnswer(invocation -> saved.get());
        service.validateConfiguration();
    }

    @Test
    void handlesOnlyTheExactPhoneWhenEnabled() {
        assertTrue(service.handles(PHONE));
        assertFalse(service.handles("+966501234567"));
        assertFalse(service.handles("0500000000"));
        assertFalse(service.handles(null));
        ReflectionTestUtils.setField(service, "enabled", false);
        assertFalse(service.handles(PHONE));
        assertThrows(BusinessRuleException.class, () -> service.requestChallenge(PHONE, "127.0.0.1"));
        assertThrows(BusinessRuleException.class, () -> service.verifyChallenge(PHONE, TEST_CODE));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"abc", "123", "12345", "１２３４", " 8642 "})
    void enabledConfigurationRejectsMissingOrMalformedCodes(String code) {
        ReflectionTestUtils.setField(service, "configuredCode", code);
        IllegalStateException error = assertThrows(IllegalStateException.class, service::validateConfiguration);
        assertEquals("Enabled fixed admin login requires a four-digit backend code.", error.getMessage());
    }

    @Test
    void disabledConfigurationDoesNotRequireASecret() {
        ReflectionTestUtils.setField(service, "enabled", false);
        ReflectionTestUtils.setField(service, "configuredCode", "");
        assertDoesNotThrow(service::validateConfiguration);
    }

    @Test
    void rejectsDisabledSafetyLimits() {
        for (String field : new String[] {"ttlMinutes", "resendCooldownSeconds", "maxVerifyAttempts"}) {
            int previous = (int) ReflectionTestUtils.getField(service, field);
            ReflectionTestUtils.setField(service, field, 0);
            assertThrows(IllegalStateException.class, service::validateConfiguration);
            ReflectionTestUtils.setField(service, field, previous);
        }
    }

    @Test
    void createsHashedExpiringChallengeWithoutSendingSmsAndInvalidatesOlderChallenges() {
        service.requestChallenge(PHONE, "127.0.0.1");
        OtpLog challenge = saved.get();
        assertEquals(PHONE, challenge.getPhoneNumber());
        assertEquals("127.0.0.1", challenge.getIpAddress());
        assertEquals(64, challenge.getCode().length());
        assertNotEquals(TEST_CODE, challenge.getCode());
        assertEquals(0, challenge.getVerificationAttempts());
        assertEquals(challenge.getAttemptedAt().plusSeconds(300), challenge.getExpiresAt());
        assertTrue(challenge.getSuccess());
        var order = inOrder(users, sms, logs);
        order.verify(users).findForOtpByPhoneNumber(PHONE);
        order.verify(sms).validateOtpRequest(PHONE, "127.0.0.1");
        order.verify(logs).expireActiveOtps(PHONE, challenge.getAttemptedAt());
        order.verify(logs).save(challenge);
        verify(sms, never()).sendOtp(anyString(), anyString(), anyString());
    }

    @Test
    void acceptsCorrectCodeOnceAndConsumesChallenge() {
        service.requestChallenge(PHONE, "127.0.0.1");
        assertTrue(service.verifyChallenge(PHONE, TEST_CODE));
        assertEquals(1, saved.get().getVerificationAttempts());
        assertFalse(saved.get().getExpiresAt().isAfter(Instant.now()));
        assertFalse(service.verifyChallenge(PHONE, TEST_CODE));
        verify(sms, never()).verifyOtp(anyString(), anyString());
    }

    @Test
    void requiresARequestBeforeVerification() {
        assertFalse(service.verifyChallenge(PHONE, TEST_CODE));
        verify(logs, never()).save(any());
    }

    @Test
    void rejectsExpiredChallengesEvenIfRepositoryReturnsOne() {
        service.requestChallenge(PHONE, "127.0.0.1");
        saved.get().setExpiresAt(Instant.now().minusSeconds(1));
        assertFalse(service.verifyChallenge(PHONE, TEST_CODE));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"0000", "1111", "abcd", "12345"})
    void rejectsWrongAndMalformedCodesAndCountsAttempts(String code) {
        service.requestChallenge(PHONE, "127.0.0.1");
        assertFalse(service.verifyChallenge(PHONE, code));
        assertEquals(1, saved.get().getVerificationAttempts());
        assertTrue(saved.get().getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    void locksOutAfterLimitAndCommitsBeforeThrowing() {
        service.requestChallenge(PHONE, "127.0.0.1");
        for (int attempt = 0; attempt < 4; attempt++) {
            assertFalse(service.verifyChallenge(PHONE, "0000"));
        }
        clearInvocations(manager, logs);
        assertThrows(RateLimitExceededException.class, () -> service.verifyChallenge(PHONE, "0000"));
        assertEquals(5, saved.get().getVerificationAttempts());
        assertFalse(saved.get().getExpiresAt().isAfter(Instant.now()));
        verify(logs).save(saved.get());
        verify(manager).commit(transactionStatus);
        verify(manager, never()).rollback(any());
        assertFalse(service.verifyChallenge(PHONE, TEST_CODE));
    }

    @Test
    void usesAnIndependentTransactionForAttemptPersistence() {
        service.requestChallenge(PHONE, "127.0.0.1");
        assertFalse(service.verifyChallenge(PHONE, "0000"));
        ArgumentCaptor<TransactionDefinition> definition = ArgumentCaptor.forClass(TransactionDefinition.class);
        verify(manager, times(2)).getTransaction(definition.capture());
        assertTrue(definition.getAllValues().stream().allMatch(
                value -> value.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRES_NEW));
        verify(manager, times(2)).commit(transactionStatus);
    }

    @Test
    void rejectsAlreadyExhaustedChallenge() {
        service.requestChallenge(PHONE, "127.0.0.1");
        saved.get().setVerificationAttempts(5);
        assertThrows(RateLimitExceededException.class, () -> service.verifyChallenge(PHONE, TEST_CODE));
        assertFalse(saved.get().getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    void codeRotationInvalidatesOutstandingChallenges() {
        service.requestChallenge(PHONE, "127.0.0.1");
        ReflectionTestUtils.setField(service, "configuredCode", "7531");
        assertFalse(service.verifyChallenge(PHONE, TEST_CODE));
        assertFalse(service.verifyChallenge(PHONE, "7531"));
    }

    @Test
    void rejectsNormalSmsOrDevCodeHashesOnTheDedicatedPath() {
        service.requestChallenge(PHONE, "127.0.0.1");
        saved.get().setCode("not-a-fixed-admin-challenge-hash");
        assertFalse(service.verifyChallenge(PHONE, TEST_CODE));
    }

    @Test
    void rejectsMissingInactiveAndNonAdminAccountsWithoutCreatingOrPromotingUsers() {
        when(users.findForOtpByPhoneNumber(PHONE)).thenReturn(Optional.empty());
        assertThrows(BusinessRuleException.class, () -> service.requestChallenge(PHONE, "127.0.0.1"));
        assertThrows(BusinessRuleException.class, () -> service.verifyChallenge(PHONE, TEST_CODE));
        for (User user : new User[] {
                User.builder().phoneNumber(PHONE).role(User.UserRole.USER).isActive(true).build(),
                User.builder().phoneNumber(PHONE).role(User.UserRole.ADMIN).isActive(false).build()
        }) {
            when(users.findForOtpByPhoneNumber(PHONE)).thenReturn(Optional.of(user));
            assertThrows(BusinessRuleException.class, () -> service.requestChallenge(PHONE, "127.0.0.1"));
            assertThrows(BusinessRuleException.class, () -> service.verifyChallenge(PHONE, TEST_CODE));
        }
        verify(users, never()).save(any());
        verify(logs, never()).save(any());
        verifyNoInteractions(sms);
    }

    @Test
    void preservesExistingRequestCooldownAndRateLimits() {
        doThrow(new RateLimitExceededException("Cooldown", 60L))
                .when(sms).validateOtpRequest(PHONE, "127.0.0.1");
        assertThrows(RateLimitExceededException.class, () -> service.requestChallenge(PHONE, "127.0.0.1"));
        verify(logs, never()).expireActiveOtps(anyString(), any());
        verify(logs, never()).save(any());
    }

    @Test
    void rejectsOtherNumbersEvenWhenCalledDirectly() {
        assertThrows(BusinessRuleException.class, () -> service.requestChallenge("+966501234567", "127.0.0.1"));
        assertThrows(BusinessRuleException.class, () -> service.verifyChallenge("+966501234567", TEST_CODE));
        verifyNoInteractions(users, logs, sms, manager);
    }
}
