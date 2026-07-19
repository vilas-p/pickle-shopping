package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.config.NotificationProperties;
import com.appaamma.pickles.domain.notification.EmailProviderType;
import com.appaamma.pickles.domain.notification.SmsProviderType;
import com.appaamma.pickles.domain.notification.WhatsAppProviderType;
import com.appaamma.pickles.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class Msg91WhatsAppProviderTest {

    private MockRestServiceServer mockServer;
    private Msg91WhatsAppProvider provider;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();

        NotificationProperties properties = new NotificationProperties(
                3,
                Duration.ofMinutes(5),
                Duration.ofMinutes(1),
                true,
                new NotificationProperties.Sms(SmsProviderType.MOCK, null, null, null, null, null, null, null),
                new NotificationProperties.WhatsApp(
                        WhatsAppProviderType.MSG91,
                        null, null, null, null,
                        "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
                        "test-auth-key",
                        "919876543210"
                ),
                new NotificationProperties.Email(EmailProviderType.MOCK, null, null, null, null, null, null, null, null)
        );

        provider = new Msg91WhatsAppProvider(properties, builder);
    }

    @Test
    void successfulSendParsesResponse() {
        mockServer.expect(requestTo("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("authkey", "test-auth-key"))
                .andRespond(withSuccess("{\"type\":\"success\",\"message\":\"Message sent\"}", MediaType.APPLICATION_JSON));

        NotificationProviderResponse response = provider.send("919999999999", "order_confirmation");

        assertThat(response.providerName()).isEqualTo("msg91-whatsapp");
        assertThat(response.rawResponse()).contains("success");
        mockServer.verify();
    }

    @Test
    void successfulTemplateSendParsesResponse() {
        mockServer.expect(requestTo("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("authkey", "test-auth-key"))
                .andRespond(withSuccess("{\"type\":\"success\",\"message_id\":\"abc123\"}", MediaType.APPLICATION_JSON));

        NotificationProviderResponse response = provider.sendTemplate(
                "919999999999", "order_confirmation", List.of("ORD-001", "Vilas")
        );

        assertThat(response.providerName()).isEqualTo("msg91-whatsapp");
        assertThat(response.rawResponse()).contains("abc123");
        mockServer.verify();
    }

    @Test
    void invalidMobileNumberRejectedBeforeApiCall() {
        assertThatThrownBy(() -> provider.send("invalid", "order_confirmation"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid mobile number format");

        assertThatThrownBy(() -> provider.send(null, "order_confirmation"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid mobile number format");
    }

    @Test
    void missingTemplateNameRejectedBeforeApiCall() {
        assertThatThrownBy(() -> provider.sendTemplate("919999999999", null, List.of("val1")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("template name is required");

        assertThatThrownBy(() -> provider.sendTemplate("919999999999", "  ", List.of("val1")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("template name is required");
    }

    @Test
    void authFailure401ReturnsClearError() {
        mockServer.expect(requestTo("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/"))
                .andRespond(withUnauthorizedRequest().body("{\"message\":\"Invalid authkey\"}"));

        assertThatThrownBy(() -> provider.send("919999999999", "order_confirmation"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("authentication failed");

        mockServer.verify();
    }

    @Test
    void rateLimited429HandledGracefully() {
        mockServer.expect(requestTo("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/"))
                .andRespond(withTooManyRequests().body("{\"message\":\"Rate limit exceeded\"}"));

        assertThatThrownBy(() -> provider.send("919999999999", "order_confirmation"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("rate limited");

        mockServer.verify();
    }

    @Test
    void serverError5xxHandledGracefully() {
        mockServer.expect(requestTo("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/"))
                .andRespond(withServerError().body("{\"error\":\"Internal server error\"}"));

        assertThatThrownBy(() -> provider.send("919999999999", "order_confirmation"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("server error");

        mockServer.verify();
    }

    @Test
    void returnsCorrectProviderType() {
        assertThat(provider.type()).isEqualTo(WhatsAppProviderType.MSG91);
    }
}
