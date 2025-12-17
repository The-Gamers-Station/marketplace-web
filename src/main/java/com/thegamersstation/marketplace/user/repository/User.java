package com.thegamersstation.marketplace.user.repository;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phone_number", nullable = false, unique = true, length = 20)
    private String phoneNumber;

    @Column(name = "username", unique = true, length = 50)
    private String username;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "city_id")
    private Long cityId;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(name = "background_image", length = 500)
    private String backgroundImage;

    @Column(name = "facebook_link", length = 200)
    private String facebookLink;

    @Column(name = "twitter_link", length = 200)
    private String twitterLink;

    @Column(name = "instagram_link", length = 200)
    private String instagramLink;

    @Column(name = "youtube_link", length = 200)
    private String youtubeLink;

    @Column(name = "linkedin_link", length = 200)
    private String linkedinLink;

    @Column(name = "github_link", length = 200)
    private String githubLink;

    @Column(name = "website_link", length = 200)
    private String websiteLink;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    @Builder.Default
    private UserRole role = UserRole.USER;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "profile_completed", nullable = false)
    @Builder.Default
    private Boolean profileCompleted = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum UserRole {
        USER, ADMIN, STORE_MANAGER
    }
}
