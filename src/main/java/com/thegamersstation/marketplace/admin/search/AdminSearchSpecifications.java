package com.thegamersstation.marketplace.admin.search;

import com.thegamersstation.marketplace.post.Post;
import com.thegamersstation.marketplace.user.repository.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class AdminSearchSpecifications {

    private AdminSearchSpecifications() {
    }

    public static Specification<Post> posts(String query, Post.PostStatus status) {
        String normalized = AdminSearchQuery.normalize(query);
        return (root, criteria, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }
            if (normalized != null) {
                String pattern = AdminSearchQuery.literalPattern(normalized);
                List<Predicate> matches = new ArrayList<>();
                matches.add(builder.like(builder.lower(root.get("title")), pattern, '!'));
                matches.add(builder.like(builder.lower(root.get("description")), pattern, '!'));
                Long id = AdminSearchQuery.exactId(normalized);
                if (id != null) {
                    matches.add(builder.equal(root.get("id"), id));
                }
                predicates.add(builder.or(matches.toArray(Predicate[]::new)));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<User> users(String query) {
        String normalized = AdminSearchQuery.normalize(query);
        return (root, criteria, builder) -> {
            if (normalized == null) {
                return builder.conjunction();
            }
            String pattern = AdminSearchQuery.literalPattern(normalized);
            List<Predicate> matches = new ArrayList<>();
            for (String field : List.of("username", "email", "phoneNumber")) {
                matches.add(builder.like(builder.lower(root.get(field)), pattern, '!'));
            }
            String digits = AdminSearchQuery.phoneDigits(normalized);
            if (digits != null) {
                matches.add(builder.like(root.get("phoneNumber"), AdminSearchQuery.literalPattern(digits), '!'));
            }
            Long id = AdminSearchQuery.exactId(normalized);
            if (id != null) {
                matches.add(builder.equal(root.get("id"), id));
            }
            return builder.or(matches.toArray(Predicate[]::new));
        };
    }
}
