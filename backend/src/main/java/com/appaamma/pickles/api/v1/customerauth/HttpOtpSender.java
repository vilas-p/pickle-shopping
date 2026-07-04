package com.appaamma.pickles.api.v1.customerauth;

import com.appaamma.pickles.config.OtpProperties;
import com.appaamma.pickles.domain.otp.OtpIdentifierKind;
import com.appaamma.pickles.domain.otp.OtpProviderType;
import com.appaamma.pickles.domain.otp.OtpPurpose;
import com.appaamma.pickles.domain.otp.OtpSender;
import com.appaamma.pickles.exception.OtpDeliveryException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class HttpOtpSender implements OtpSender {

    private final OtpProperties props;
    private final RestClient.Builder restClientBuilder;

    @Override
    public OtpProviderType type() {
        return OtpProviderType.HTTP;
    }

    @Override
    public String send(OtpIdentifierKind kind, String identifier, String code, OtpPurpose purpose) {
        OtpProperties.HttpProvider http = props.http();
        String url = http.url();
        if (url == null || url.isBlank()) {
            log.error("HTTP OTP provider selected but app.otp.http.url is empty");
            throw new OtpDeliveryException("Unable to send OTP right now. Please try again later.");
        }

        String message = renderMessage(http.messageTemplate(), identifier, code, kind, purpose);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("identifier", identifier);
        payload.put("kind", kind.name());
        payload.put("purpose", purpose.name());
        payload.put("code", code);
        payload.put("message", message);
        payload.put("ttlSeconds", props.ttl().toSeconds());

        try {
            RestClient.RequestBodySpec request = restClientBuilder.build()
                    .post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON);

            if (http.authToken() != null && !http.authToken().isBlank()) {
                request.header(resolveHeaderName(http.authHeaderName()), http.authToken());
            }

            request.body(payload)
                    .retrieve()
                    .toBodilessEntity();
            return resolveChannelName(http.channelName());
        } catch (RestClientException ex) {
            log.error("OTP delivery failed via HTTP provider for {} {}", kind, identifier, ex);
            throw new OtpDeliveryException("Unable to send OTP right now. Please try again later.", ex);
        }
    }

    private String renderMessage(String template,
                                 String identifier,
                                 String code,
                                 OtpIdentifierKind kind,
                                 OtpPurpose purpose) {
        String resolvedTemplate = (template == null || template.isBlank())
                ? "Your Appa & Amma's Pickles {{purpose}} code is {{code}}. It expires in {{ttlMinutes}} minutes."
                : template;

        return resolvedTemplate
                .replace("{{identifier}}", identifier)
                .replace("{{kind}}", kind.name())
                .replace("{{purpose}}", purpose.name().toLowerCase())
                .replace("{{code}}", code)
                .replace("{{ttlMinutes}}", String.valueOf(Math.max(1, props.ttl().toMinutes())));
    }

    private String resolveHeaderName(String headerName) {
        return (headerName == null || headerName.isBlank()) ? "Authorization" : headerName;
    }

    private String resolveChannelName(String channelName) {
        return (channelName == null || channelName.isBlank()) ? "http" : channelName;
    }
}