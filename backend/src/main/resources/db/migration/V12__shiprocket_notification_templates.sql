-- ============================================================
-- V12: Notification templates for Shiprocket shipping events
-- ============================================================

-- New Shiprocket-specific templates (these codes don't exist yet)
INSERT INTO notification_template (template_code, channel, locale, subject_template, body_template, description, active, created_at, updated_at) VALUES
('SHIPMENT_CREATED_WHATSAPP', 'WHATSAPP', 'en_IN', NULL,
 'Shipment Created!\n\nHi {{CustomerName}},\n\nYour order {{OrderId}} has been prepared for shipping.\n\nWe will notify you once it is picked up by the courier.\n\n— Appa & Amma''s Pickles',
 'Sent when shipment is created on Shiprocket', b'1', NOW(6), NOW(6)),

('ORDER_SHIPPED_EMAIL', 'EMAIL', 'en_IN', 'Your order {{OrderId}} has been shipped!',
 '<h2>Your order is on its way!</h2><p>Hi {{CustomerName}},</p><p>Great news! Your order <strong>{{OrderId}}</strong> has been shipped.</p><p><strong>Courier:</strong> {{CourierName}}<br/><strong>Tracking Number:</strong> {{TrackingNumber}}<br/><strong>Expected Delivery:</strong> {{EstimatedDeliveryDate}}</p><p><a href="{{TrackingUrl}}">Track your order</a></p><p>— Appa & Amma''s Pickles</p>',
 'Shipping confirmation email with tracking details', b'1', NOW(6), NOW(6)),

('SHIPMENT_CANCELLED_WHATSAPP', 'WHATSAPP', 'en_IN', NULL,
 'Shipment Cancelled\n\nHi {{CustomerName}},\n\nYour order {{OrderId}} shipment has been cancelled.\n\nReason: {{CancellationReason}}\n\nIf this was prepaid, your refund will be processed within 5-7 business days.\n\n— Appa & Amma''s Pickles',
 'Sent when shipment is cancelled', b'1', NOW(6), NOW(6)),

('RTO_INITIATED_WHATSAPP', 'WHATSAPP', 'en_IN', NULL,
 'Package Returning\n\nHi {{CustomerName}},\n\nYour order {{OrderId}} could not be delivered and is being returned to us.\n\nWe will reach out to reschedule delivery or process a refund.\n\n— Appa & Amma''s Pickles',
 'Sent when RTO is initiated', b'1', NOW(6), NOW(6));

-- Update existing templates to add Shiprocket-specific fields (courier/AWB info)
UPDATE notification_template
SET body_template = 'Hello {{CustomerName}}, your order {{OrderId}} has left our kitchen and is on its way to you.\n\nCourier: {{CourierName}}\nTracking: {{TrackingNumber}}\nExpected by: {{EstimatedDeliveryDate}}\n\nTrack here: {{TrackingUrl}}',
    updated_at = NOW(6)
WHERE template_code = 'ORDER_SHIPPED_WHATSAPP';

UPDATE notification_template
SET body_template = 'Hello {{CustomerName}}, your order {{OrderId}} is out for delivery today!\n\nCourier: {{CourierName}}\n\nPlease keep your phone handy.\n\n— Appa & Amma''s Pickles',
    updated_at = NOW(6)
WHERE template_code = 'OUT_FOR_DELIVERY_WHATSAPP';

UPDATE notification_template
SET subject_template = 'Your order {{OrderId}} has been delivered!',
    body_template = '<h2>Order Delivered!</h2><p>Hi {{CustomerName}},</p><p>Your order <strong>{{OrderId}}</strong> has been successfully delivered.</p><p>We hope you enjoy our homemade pickles!</p><p><a href="{{ReviewUrl}}">Leave a review</a></p><p>— Appa & Amma''s Pickles</p>',
    updated_at = NOW(6)
WHERE template_code = 'ORDER_DELIVERED_EMAIL';
