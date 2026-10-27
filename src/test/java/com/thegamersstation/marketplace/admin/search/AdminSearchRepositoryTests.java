package com.thegamersstation.marketplace.admin.search;

import com.thegamersstation.marketplace.category.Category;
import com.thegamersstation.marketplace.city.City;
import com.thegamersstation.marketplace.common.exception.BusinessRuleException;
import com.thegamersstation.marketplace.post.Post;
import com.thegamersstation.marketplace.post.PostImage;
import com.thegamersstation.marketplace.post.PostRepository;
import com.thegamersstation.marketplace.region.Region;
import com.thegamersstation.marketplace.store.Store;
import com.thegamersstation.marketplace.user.repository.User;
import com.thegamersstation.marketplace.user.repository.UsersRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Actual SQL queries against an isolated H2 database. No Spring application,
 * production configuration, Flyway migrations or external services are loaded.
 */
class AdminSearchRepositoryTests {

    private static SessionFactory factory;
    private Session session;
    private UsersRepository users;
    private PostRepository posts;
    private User alice;
    private User bob;
    private Post console;
    private Post controller;
    private Category category;
    private City city;
    private static final PageRequest PAGE = PageRequest.of(0, 100, Sort.by("id"));

    @BeforeAll
    static void database() {
        Configuration config = new Configuration()
                .setProperty("hibernate.connection.url", "jdbc:h2:mem:admin-search;MODE=MySQL;DB_CLOSE_DELAY=-1")
                .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
                .setProperty("hibernate.hbm2ddl.auto", "create-drop")
                .setProperty("hibernate.show_sql", "false")
                .setProperty("hibernate.jdbc.time_zone", "UTC");
        for (Class<?> entity : List.of(User.class, Post.class, PostImage.class, Category.class,
                City.class, Region.class, Store.class)) {
            config.addAnnotatedClass(entity);
        }
        factory = config.buildSessionFactory();
    }

    @AfterAll
    static void closeDatabase() {
        if (factory != null) factory.close();
    }

    @BeforeEach
    void fixtures() {
        session = factory.openSession();
        session.beginTransaction();
        JpaRepositoryFactory repositories = new JpaRepositoryFactory(session);
        users = repositories.getRepository(UsersRepository.class);
        posts = repositories.getRepository(PostRepository.class);
        alice = user("Alice_ONE", "Alice@example.com", "+966551886632");
        bob = user("Bob", "Buyer@example.com", "+966501234567");
        bob.setIsActive(false);
        user(null, null, "+966599999999");
        user("لاعب عربي", null, "+966588888888");
        user("Deals%Only!", null, "+966577777777");
        Instant now = Instant.now();
        category = Category.builder().nameEn("Games").nameAr("ألعاب").slug("games").level(1).createdAt(now).build();
        session.persist(category);
        Region region = Region.builder().nameEn("Test region").nameAr("منطقة").slug("test-region").createdAt(now).build();
        session.persist(region);
        city = City.builder().nameEn("Test city").nameAr("مدينة").slug("test-city").region(region).createdAt(now).build();
        session.persist(city);
        console = post("PlayStation Console", "Great condition", Post.PostStatus.ACTIVE);
        controller = post("Controller", "PlayStation compatible", Post.PostStatus.BLOCKED);
        post("جهاز ألعاب", "للبيع", Post.PostStatus.WAITING_APPROVAL);
        post("100%_Deal!", "Literal symbols", Post.PostStatus.SOLD);
        session.flush();
    }

    @AfterEach
    void rollback() {
        if (session != null) {
            if (session.getTransaction().isActive()) session.getTransaction().rollback();
            session.close();
        }
    }

    private User user(String name, String email, String phone) {
        User user = User.builder().username(name).email(email).phoneNumber(phone).createdAt(Instant.now()).build();
        session.persist(user);
        return user;
    }

    private Post post(String title, String description, Post.PostStatus status) {
        Post post = Post.builder().title(title).slug("test-" + java.util.UUID.randomUUID())
                .description(description).status(status).type(Post.PostType.SELL).owner(alice)
                .category(category).city(city).createdAt(LocalDateTime.now()).build();
        session.persist(post);
        return post;
    }

    @Test
    void postsMatchTitleAndDescriptionCaseInsensitivelyAcrossStatuses() {
        var result = posts.findAll(AdminSearchSpecifications.posts("  PLAYstation  ", null), PAGE);
        assertEquals(2, result.getTotalElements());
        assertEquals(List.of(console.getId(), controller.getId()), result.map(Post::getId).getContent());
    }

    @Test
    void postSearchCombinesWithStatusBeforeCounting() {
        var result = posts.findAll(AdminSearchSpecifications.posts("playstation", Post.PostStatus.ACTIVE), PAGE);
        assertEquals(1, result.getTotalElements());
        assertEquals(console.getId(), result.getContent().getFirst().getId());
        assertEquals(0, posts.findAll(AdminSearchSpecifications.posts("playstation", Post.PostStatus.SOLD), PAGE).getTotalElements());
    }

    @Test
    void paginatedPostSearchHasCorrectTotalAndNoDuplicateRows() {
        var spec = AdminSearchSpecifications.posts("playstation", null);
        var first = posts.findAll(spec, PageRequest.of(0, 1, Sort.by("id")));
        var second = posts.findAll(spec, PageRequest.of(1, 1, Sort.by("id")));
        assertEquals(2, first.getTotalElements());
        assertEquals(2, second.getTotalElements());
        assertEquals(2, second.getTotalPages());
        assertNotEquals(first.getContent().getFirst().getId(), second.getContent().getFirst().getId());
    }

    @Test
    void supportsArabicTextForBothResources() {
        assertEquals(1, posts.findAll(AdminSearchSpecifications.posts("ألعاب", null), PAGE).getTotalElements());
        assertEquals(1, users.findAll(AdminSearchSpecifications.users("عربي"), PAGE).getTotalElements());
    }

    @Test
    void numericQueriesMatchExactIdsWithoutCastingDatabaseColumns() {
        assertEquals(alice.getId(), users.findAll(AdminSearchSpecifications.users(alice.getId().toString()), PAGE)
                .getContent().getFirst().getId());
        assertEquals(console.getId(), posts.findAll(AdminSearchSpecifications.posts(console.getId().toString(), null), PAGE)
                .getContent().getFirst().getId());
        assertNull(AdminSearchQuery.exactId("9999999999999999999999999999"));
        assertEquals(0, posts.findAll(AdminSearchSpecifications.posts("9999999999999999999999999999", null), PAGE).getTotalElements());
    }

    @ParameterizedTest
    @ValueSource(strings = {"%", "_", "!"})
    void treatsLikeWildcardsAndEscapeCharacterAsLiteralText(String query) {
        assertEquals(1, posts.findAll(AdminSearchSpecifications.posts(query, null), PAGE).getTotalElements());
        assertEquals(1, users.findAll(AdminSearchSpecifications.users(query), PAGE).getTotalElements());
    }

    @Test
    void injectionLikeTextIsNotExecutableSql() {
        assertEquals(0, users.findAll(AdminSearchSpecifications.users("' OR 1=1 --"), PAGE).getTotalElements());
        assertEquals(0, posts.findAll(AdminSearchSpecifications.posts("' OR 1=1 --", null), PAGE).getTotalElements());
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "\t"})
    void emptySearchPreservesUnfilteredTotals(String query) {
        assertEquals(5, users.findAll(AdminSearchSpecifications.users(query), PAGE).getTotalElements());
        assertEquals(4, posts.findAll(AdminSearchSpecifications.posts(query, null), PAGE).getTotalElements());
        assertEquals(1, posts.findAll(AdminSearchSpecifications.posts(query, Post.PostStatus.BLOCKED), PAGE).getTotalElements());
    }

    @Test
    void searchesNamesEmailsAndHandlesNullFieldsAndInactiveUsers() {
        assertEquals(1, users.findAll(AdminSearchSpecifications.users("alice"), PAGE).getTotalElements());
        assertEquals(2, users.findAll(AdminSearchSpecifications.users("EXAMPLE.COM"), PAGE).getTotalElements());
        assertEquals(bob.getId(), users.findAll(AdminSearchSpecifications.users("buyer"), PAGE).getContent().getFirst().getId());
        assertEquals(0, users.findAll(AdminSearchSpecifications.users("missing"), PAGE).getTotalElements());
    }

    @ParameterizedTest
    @ValueSource(strings = {"+966551886632", "966551886632", "+966 (55) 188-6632", "0551886632", "1886632"})
    void supportsFormattedAndPartialPhoneQueries(String query) {
        var result = users.findAll(AdminSearchSpecifications.users(query), PAGE);
        assertEquals(1, result.getTotalElements());
        assertEquals(alice.getId(), result.getContent().getFirst().getId());
    }

    @Test
    void userPaginationCountsFilteredRecordsNotTheCurrentPage() {
        var result = users.findAll(AdminSearchSpecifications.users("example.com"),
                PageRequest.of(1, 1, Sort.by("id")));
        assertEquals(2, result.getTotalElements());
        assertEquals(bob.getId(), result.getContent().getFirst().getId());
    }

    @Test
    void rejectsOverlongQueriesAndAcceptsTheBoundary() {
        assertThrows(BusinessRuleException.class, () -> AdminSearchSpecifications.posts("a".repeat(201), null));
        assertThrows(BusinessRuleException.class, () -> AdminSearchSpecifications.users("a".repeat(201)));
        assertEquals(0, users.findAll(AdminSearchSpecifications.users("a".repeat(200)), PAGE).getTotalElements());
    }
}
