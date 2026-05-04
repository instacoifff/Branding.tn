// BrandingTN — Email Notification Sender via Resend
// Deploy as Supabase Edge Function: supabase functions deploy send-email-notification
//
// Required env vars:
//   - RESEND_API_KEY
//
// Usage: POST /functions/v1/send-email-notification
// Body: { to, subject, senderName, projectName, messagePreview, actionUrl }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, subject, senderName, projectName, messagePreview, actionUrl } = await req.json();

    if (!to || !subject) {
      return new Response(JSON.stringify({ error: "Missing 'to' or 'subject'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Beautiful branded email template
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
        branding<span style="color:#3b82f6;">.</span>tn
      </span>
    </div>
    
    <!-- Card -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;margin-bottom:24px;">
      <!-- Sender -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;">
          ${(senderName || "B")[0].toUpperCase()}
        </div>
        <div>
          <p style="margin:0;color:#ffffff;font-weight:600;font-size:14px;">${senderName || "BrandingTN Team"}</p>
          <p style="margin:2px 0 0;color:#71717a;font-size:12px;">re: ${projectName || "Your Project"}</p>
        </div>
      </div>
      
      <!-- Message Preview -->
      <div style="background:#09090b;border:1px solid #27272a;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#d4d4d8;font-size:14px;line-height:1.6;">
          ${messagePreview || "You have a new notification."}
        </p>
      </div>
      
      <!-- CTA Button -->
      <a href="${actionUrl || "https://branding.tn/dashboard"}" 
         style="display:block;text-align:center;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#ffffff;font-weight:600;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;">
        Read Message →
      </a>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;">
      <p style="color:#52525b;font-size:11px;margin:0;">
        This email was sent by BrandingTN. You're receiving this because you're part of an active project.
      </p>
      <p style="color:#3f3f46;font-size:11px;margin:8px 0 0;">
        <a href="${actionUrl || "https://branding.tn/dashboard"}" style="color:#3b82f6;text-decoration:none;">Open Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    // Send via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BrandingTN <noreply@branding.tn>",
        to: Array.isArray(to) ? to : [to],
        subject,
        html: htmlBody,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Email send error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
