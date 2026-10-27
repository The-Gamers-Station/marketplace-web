package com.thegamersstation.marketplace.admin.search;

import com.thegamersstation.marketplace.common.exception.BusinessRuleException;
import com.thegamersstation.marketplace.common.validation.PhoneValidator;

import java.util.Locale;

public final class AdminSearchQuery {

    public static final int MAX_LENGTH = 200;

    private AdminSearchQuery() {
    }

    public static String normalize(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        String normalized = query.strip();
        if (normalized.length() > MAX_LENGTH) {
            throw new BusinessRuleException(
                    "Search must be at most 200 characters.",
                    "يجب ألا يتجاوز البحث 200 حرف.");
        }
        return normalized;
    }

    public static String literalPattern(String query) {
        String escaped = query.toLowerCase(Locale.ROOT)
                .replace("!", "!!").replace("%", "!%").replace("_", "!_");
        return "%" + escaped + "%";
    }

    public static Long exactId(String query) {
        if (!query.matches("[0-9]+")) {
            return null;
        }
        try {
            long id = Long.parseLong(query);
            return id > 0 ? id : null;
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    public static String phoneDigits(String query) {
        if (!query.matches("[+0-9\\s()\\-]+")) {
            return null;
        }
        String digits = query.replaceAll("[+\\s()\\-]", "");
        if (digits.isEmpty()) {
            return null;
        }
        String normalized = PhoneValidator.normalize(digits);
        return normalized == null ? digits : normalized.substring(1);
    }
}
