package com.appaamma.pickles.api.v1.customerauth.otp;

import com.appaamma.pickles.domain.credential.CredService;
import com.appaamma.pickles.domain.credential.CredentialProvider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Factory that selects the appropriate OTP delivery strategy
 * based on the active provider configured in the database.
 */
@Slf4j
@Component
public class OtpDeliveryStrategyFactory {

    private static final String DEFAULT_PROVIDER = "MOCK";

    private final CredService credService;
    private final Map<String, OtpDeliveryStrategy> strategyMap;
    private final OtpDeliveryStrategy defaultStrategy;

    public OtpDeliveryStrategyFactory(CredService credService, List<OtpDeliveryStrategy> strategies) {
        this.credService = credService;
        this.strategyMap = strategies.stream()
            .collect(Collectors.toMap(OtpDeliveryStrategy::getProviderCode, Function.identity()));
        this.defaultStrategy = strategyMap.get(DEFAULT_PROVIDER);

        log.info("Registered OTP delivery strategies: {}", strategyMap.keySet());
    }

    /**
     * Returns the active OTP delivery strategy based on DB configuration.
     * Falls back to MOCK if no provider is active.
     */
    public OtpDeliveryStrategy getActiveStrategy() {
        // Check WhatsApp Business API first (higher priority)
        CredentialProvider provider = credService.getEntryValue("OTP");
        return getStrategy(provider.getCode());
    }

    /**
     * Returns strategy by provider code.
     */
    public OtpDeliveryStrategy getStrategy(String providerCode) {
        return strategyMap.getOrDefault(providerCode, defaultStrategy);
    }
}
