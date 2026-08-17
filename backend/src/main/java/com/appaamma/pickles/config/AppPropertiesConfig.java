package com.appaamma.pickles.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        JwtProperties.class,
        CustomerJwtProperties.class,
        CorsProperties.class,
        NotificationProperties.class,
        OtpProperties.class,
        StoreLocationProperties.class,
        ShiprocketProperties.class,
        S3StorageProperties.class
})
public class AppPropertiesConfig {
}
