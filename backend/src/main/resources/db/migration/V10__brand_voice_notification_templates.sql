UPDATE notification_template
SET body_template = 'Hello {{CustomerName}}, your order {{OrderId}} is in. We are preparing {{Items}} with care from our kitchen near Bidar. Total: {{Amount}}. We''ll let you know when it begins its journey to you.',
    description = 'Order placed notification over WhatsApp in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'ORDER_PLACED_WHATSAPP';

UPDATE notification_template
SET subject_template = 'Your Appa & Amma''s Pickles order {{OrderId}} is in',
    body_template = 'Hello {{CustomerName}}, your order {{OrderId}} is in. We are preparing {{Items}} with care from our kitchen near Bidar. Total: {{Amount}}. We''ll let you know when it begins its journey to you.',
    description = 'Order placed notification email in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'ORDER_PLACED_EMAIL';

UPDATE notification_template
SET body_template = 'Hello {{CustomerName}}, we received your payment of {{Amount}} for order {{OrderId}}. Thank you for trusting us with a place on your table.',
    description = 'Payment success over WhatsApp in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'PAYMENT_SUCCESS_WHATSAPP';

UPDATE notification_template
SET body_template = 'Hello {{CustomerName}}, your order {{OrderId}} has been packed and is almost ready to leave our kitchen.',
    description = 'Order packed notification in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'ORDER_PACKED_WHATSAPP';

UPDATE notification_template
SET body_template = 'Hello {{CustomerName}}, your order {{OrderId}} has left our kitchen and is on its way to you. Tracking number: {{TrackingNumber}}. Track here: {{TrackingUrl}}',
    description = 'Order shipped notification in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'ORDER_SHIPPED_WHATSAPP';

UPDATE notification_template
SET body_template = 'Hello {{CustomerName}}, your order {{OrderId}} is out for delivery today. We hope it reaches you feeling like something familiar.',
    description = 'Out for delivery notification in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'OUT_FOR_DELIVERY_WHATSAPP';

UPDATE notification_template
SET body_template = 'Hello {{CustomerName}}, your order {{OrderId}} has been delivered. We hope the first spoon brings back a good memory.',
    description = 'Delivered notification over WhatsApp in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'ORDER_DELIVERED_WHATSAPP';

UPDATE notification_template
SET subject_template = 'Your Appa & Amma''s Pickles parcel has arrived',
    body_template = 'Hello {{CustomerName}}, your order {{OrderId}} has been delivered. We hope the first spoon brings back a good memory.',
    description = 'Delivered notification email in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'ORDER_DELIVERED_EMAIL';

UPDATE notification_template
SET body_template = 'Hello {{CustomerName}}, if this jar brought back something familiar, we would be grateful if you shared a note here: {{ReviewLink}}',
    description = 'Review request over WhatsApp in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'REVIEW_REQUEST_WHATSAPP';

UPDATE notification_template
SET subject_template = 'Welcome to Appa & Amma''s Pickles',
    body_template = 'Hello {{CustomerName}}, welcome to Appa & Amma''s Pickles. We are glad to send a little piece of home to your table.',
    description = 'Customer welcome email in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'USER_REGISTERED_EMAIL';

UPDATE notification_template
SET subject_template = 'Order {{OrderId}} cancelled',
    body_template = 'Hello {{CustomerName}}, your order {{OrderId}} has been cancelled. If you need help placing it again, please reply and we will help personally.',
    description = 'Order cancelled notification in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'ORDER_CANCELLED';

UPDATE notification_template
SET subject_template = 'Payment incomplete for order {{OrderId}}',
    body_template = 'Hello {{CustomerName}}, payment for order {{OrderId}} could not be completed. If you would like, we can help you try again.',
    description = 'Payment failed notification in brand voice',
    updated_at = NOW(6)
WHERE template_code = 'PAYMENT_FAILED';
