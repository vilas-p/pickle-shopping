package com.appaamma.pickles;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.flyway.enabled=false",
        "app.otp.code-length=6",
        "app.otp.ttl=PT10M",
        "app.otp.max-attempts=5",
        "app.otp.rate-limit-max-per-window=10",
        "app.otp.rate-limit-window=PT1H",
        "app.razorpay.key-id=rzp_test_placeholder",
        "app.razorpay.key-secret=placeholder_secret"
})
@ActiveProfiles("test")
class PicklesApplicationTests {

    @Test
    void contextLoads() {
    }
}
