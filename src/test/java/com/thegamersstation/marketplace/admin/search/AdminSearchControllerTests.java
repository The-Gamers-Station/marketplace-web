package com.thegamersstation.marketplace.admin.search;

import com.thegamersstation.marketplace.admin.post.PostModerationController;
import com.thegamersstation.marketplace.admin.post.PostModerationService;
import com.thegamersstation.marketplace.admin.user.UserModerationController;
import com.thegamersstation.marketplace.admin.user.UserModerationService;
import com.thegamersstation.marketplace.common.dto.PageRequestDto;
import com.thegamersstation.marketplace.common.dto.PageResponseDto;
import com.thegamersstation.marketplace.common.exception.GlobalExceptionHandler;
import com.thegamersstation.marketplace.common.util.LocalizationService;
import com.thegamersstation.marketplace.post.Post;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@WebMvcTest(excludeAutoConfiguration = UserDetailsServiceAutoConfiguration.class)
@ContextConfiguration(classes = {
        AdminSearchControllerTests.TestSecurity.class, PostModerationController.class,
        UserModerationController.class, GlobalExceptionHandler.class, LocalizationService.class
})
class AdminSearchControllerTests {

    @Configuration
    @EnableMethodSecurity
    static class TestSecurity {
        @Bean
        SecurityFilterChain testChain(HttpSecurity http) throws Exception {
            return http.csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .exceptionHandling(errors -> errors.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                    .build();
        }
    }

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private PostModerationService posts;

    @MockitoBean
    private UserModerationService users;

    @Test
    void adminPostSearchForwardsNormalizedQueryStatusAndPage() throws Exception {
        when(posts.getAllPosts(any(), any(), any())).thenReturn(
                new PageResponseDto<>(List.of(), 1, 2, 0, 0, false, true));
        mvc.perform(get("/admin/posts").with(user("admin").roles("ADMIN"))
                        .param("q", "  Console  ").param("status", "BLOCKED").param("page", "1").param("size", "2")
                        .param("sortBy", "title").param("direction", "ASC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
        ArgumentCaptor<Pageable> page = ArgumentCaptor.forClass(Pageable.class);
        verify(posts).getAllPosts(eq(Post.PostStatus.BLOCKED), eq("Console"), page.capture());
        assertEquals(1, page.getValue().getPageNumber());
        assertEquals(2, page.getValue().getPageSize());
        assertTrue(page.getValue().getSort().getOrderFor("title").isAscending());
    }

    @Test
    void adminUserSearchForwardsPhoneAndPagination() throws Exception {
        when(users.getAllUsers(any(), any())).thenReturn(
                new PageResponseDto<>(List.of(), 0, 10, 0, 0, true, true));
        mvc.perform(get("/api/admin/users").with(user("admin").roles("ADMIN"))
                        .param("q", " +966 (55) 188-6632 ").param("size", "10"))
                .andExpect(status().isOk());
        ArgumentCaptor<PageRequestDto> page = ArgumentCaptor.forClass(PageRequestDto.class);
        verify(users).getAllUsers(page.capture(), eq("+966 (55) 188-6632"));
        assertEquals(10, page.getValue().getSize());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/admin/posts", "/api/admin/users"})
    void rejectsNonAdminAndAnonymousSearch(String endpoint) throws Exception {
        mvc.perform(get(endpoint).param("q", "private"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get(endpoint).with(user("customer").roles("USER")).param("q", "private"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(posts, users);
    }

    @ParameterizedTest
    @ValueSource(strings = {"/admin/posts", "/api/admin/users"})
    void overlongQueryReturnsBusinessRuleErrorBeforeServiceInvocation(String endpoint) throws Exception {
        mvc.perform(get(endpoint).with(user("admin").roles("ADMIN")).header("Accept-Language", "en").param("q", "a".repeat(201)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Search must be at most 200 characters."));
        verifyNoInteractions(posts, users);
    }

    @Test
    void missingOrBlankQueryRetainsBackwardCompatibility() throws Exception {
        when(posts.getAllPosts(any(), any(), any())).thenReturn(
                new PageResponseDto<>(List.of(), 0, 20, 0, 0, true, true));
        when(users.getAllUsers(any(), any())).thenReturn(
                new PageResponseDto<>(List.of(), 0, 20, 0, 0, true, true));
        mvc.perform(get("/admin/posts").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk());
        mvc.perform(get("/api/admin/users").with(user("admin").roles("ADMIN")).param("q", "   "))
                .andExpect(status().isOk());
        verify(posts).getAllPosts(isNull(), isNull(), any());
        verify(users).getAllUsers(any(), isNull());
    }
}
