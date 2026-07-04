package com.appaamma.pickles.api.v1.notification;

import com.appaamma.pickles.domain.notification.NotificationChannel;
import com.appaamma.pickles.domain.notification.NotificationTemplate;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationTemplateEngineTest {

    private final NotificationTemplateEngine engine = new NotificationTemplateEngine();

    @Test
    void replacesPlaceholdersInSubjectAndBody() {
        NotificationTemplate template = NotificationTemplate.builder()
                .templateCode("ORDER_SHIPPED_WHATSAPP")
                .channel(NotificationChannel.WHATSAPP)
                .subjectTemplate("Order {{OrderId}} update")
                .bodyTemplate("Hello {{CustomerName}}, your order {{OrderId}} has shipped.")
                .build();

        RenderedTemplate rendered = engine.render(template, Map.of(
                "CustomerName", "Vilas",
                "OrderId", "AAP12345"
        ));

        assertThat(rendered.subject()).isEqualTo("Order AAP12345 update");
        assertThat(rendered.body()).isEqualTo("Hello Vilas, your order AAP12345 has shipped.");
    }
}