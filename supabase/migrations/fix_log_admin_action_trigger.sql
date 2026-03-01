-- Fix the log_admin_action trigger which referenced 'approved' — an invalid
-- post_status enum value. The correct value is 'published' (set by approvePost).
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
    action_name TEXT;
    admin_user_id UUID;
BEGIN
    -- Determine the action type
    IF NEW.status = 'published' AND OLD.status = 'pending' THEN
        action_name := 'approve_post';
    ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
        action_name := 'reject_post';
    ELSE
        RETURN NEW;
    END IF;

    -- Get the admin user ID (assuming it's stored in approved_by or rejected_by)
    IF NEW.approved_by IS NOT NULL THEN
        admin_user_id := NEW.approved_by;
    ELSIF NEW.rejected_by IS NOT NULL THEN
        admin_user_id := NEW.rejected_by;
    END IF;

    -- Log the action
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO admin_activity_log (
            admin_id,
            action,
            resource_type,
            resource_id,
            details
        ) VALUES (
            admin_user_id,
            action_name,
            'post',
            NEW.id,
            jsonb_build_object(
                'post_title', NEW.title,
                'author_id', NEW.author_id,
                'rejection_reason', NEW.rejection_reason
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
