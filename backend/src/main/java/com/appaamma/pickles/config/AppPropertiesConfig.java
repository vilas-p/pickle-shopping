package com.appaamma.pickles.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        JwtProperties.class,
        CustomerJwtProperties.class,
        CorsProperties.class,
        OtpProperties.class,
        RazorpayProperties.class,
        StoreLocationProperties.class
})
public class AppPropertiesConfig {
}
