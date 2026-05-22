-- =====================================================================
-- 0026_chat_reply_notification.sql
-- Add chat_reply notification type for quote-reply pings.
-- =====================================================================

alter type public.notification_type add value if not exists 'chat_reply';
