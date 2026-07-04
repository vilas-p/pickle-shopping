package com.appaamma.pickles.api.v1.notification;

import com.appaamma.pickles.domain.notification.NotificationTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class NotificationTemplateEngine {

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{\\s*([A-Za-z0-9_]+)\\s*}}") ;

    public RenderedTemplate render(NotificationTemplate template, Map<String, Object> variables) {
        String subject = template.getSubjectTemplate() == null
                ? null
                : renderText(template.getSubjectTemplate(), variables);
        String body = renderText(template.getBodyTemplate(), variables);
        return new RenderedTemplate(subject, body);
    }

    public String renderText(String template, Map<String, Object> variables) {
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(template);
        StringBuffer rendered = new StringBuffer(template.length());
        while (matcher.find()) {
            String key = matcher.group(1);
            Object value = variables.get(key);
            String replacement = value == null ? "" : String.valueOf(value);
            matcher.appendReplacement(rendered, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(rendered);
        return rendered.toString();
    }
}