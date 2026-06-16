package com.thegamersstation.marketplace.seo;

import com.thegamersstation.marketplace.post.Post;
import com.thegamersstation.marketplace.post.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SitemapService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE;

    private final PostRepository postRepository;

    @Value("${notification.frontend-url:https://gamers-station.com}")
    private String frontendUrl;

    public String generateSitemapXml() {
        String baseUrl = normalizeBaseUrl(frontendUrl);
        String today = LocalDate.now(ZoneOffset.UTC).format(DATE_FORMATTER);

        StringBuilder xml = new StringBuilder(8192);
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        appendUrl(xml, baseUrl + "/", today, "daily", "1.0");
        appendUrl(xml, baseUrl + "/merchants", today, "daily", "0.9");

        appendUrl(xml, baseUrl + "/category/playstation", today, "daily", "0.8");
        appendUrl(xml, baseUrl + "/category/xbox", today, "daily", "0.8");
        appendUrl(xml, baseUrl + "/category/nintendo", today, "daily", "0.8");
        appendUrl(xml, baseUrl + "/category/pc-gaming", today, "daily", "0.8");
        appendUrl(xml, baseUrl + "/category/accessories", today, "daily", "0.8");

        appendUrl(xml, baseUrl + "/products", today, "daily", "0.8");
        appendUrl(xml, baseUrl + "/faq", today, "weekly", "0.5");

        List<Post> activePosts = postRepository.findAllByStatusOrderByCreatedAtAsc(Post.PostStatus.ACTIVE);
        for (Post post : activePosts) {
            String postPath = post.getSlug() != null && !post.getSlug().isBlank()
                ? "/ad/" + post.getSlug()
                : "/product/" + post.getId();
            String lastMod = (post.getUpdatedAt() != null ? post.getUpdatedAt() : post.getCreatedAt())
                .toLocalDate()
                .format(DATE_FORMATTER);
            appendUrl(xml, baseUrl + postPath, lastMod, "daily", "0.7");
        }

        xml.append("</urlset>");
        return xml.toString();
    }

    private void appendUrl(StringBuilder xml, String location, String lastmod, String changefreq, String priority) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(escapeXml(location)).append("</loc>\n");
        xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }

    private String normalizeBaseUrl(String url) {
        if (url == null || url.isBlank()) {
            return "https://gamers-station.com";
        }
        String normalized = url.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private String escapeXml(String value) {
        return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&apos;");
    }
}
