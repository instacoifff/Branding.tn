-- ============================================================
-- Track 35: Enriched Canned Responses Library
-- Comprehensive quick replies for all client interaction stages
-- Run in Supabase SQL Editor
-- ============================================================

INSERT INTO public.canned_responses (shortcut, response_text) VALUES

-- ── ONBOARDING & WELCOME ──────────────────────────────────────
('welcome',
 'Welcome aboard! 🎉 We''re thrilled to be working with you. Our team has reviewed your brief and we''re excited to bring your vision to life. We''ll be in touch shortly with next steps.'),

('kickoff',
 'Your project is officially live! 🚀 We''ve assigned your dedicated creative team and the brief has been reviewed. Expect our first concepts within the agreed timeline. Feel free to ask us anything along the way.'),

('intro',
 'Hi! I''m your dedicated creative contact at Branding.tn. I''ll be your main point of communication throughout the project. Don''t hesitate to reach out anytime — we''re here to make this experience seamless for you.'),

('brief_confirm',
 'We''ve received your creative brief and everything looks great! We have a clear picture of your vision, target audience, and brand goals. Our team is diving in now. 🎨'),

('deposit_confirm',
 'Great news — your deposit has been received and confirmed! Your project is now officially in our queue and our creative team will begin work shortly.'),

-- ── CONCEPTS & FIRST DELIVERY ─────────────────────────────────
('concepts_ready',
 'Exciting update! ✨ Your first round of concepts is now ready for review in the Files tab above. Please take your time exploring the designs and share your thoughts, preferences, or any changes you''d like to see.'),

('concepts_explain',
 'We''ve prepared multiple concept directions, each exploring a different visual approach for your brand. We recommend reviewing all options before deciding on a direction — sometimes the best ideas come from combining elements!'),

('first_look',
 'We''d love your honest first reaction! There are no wrong answers — your instinctive response to the designs is exactly the kind of feedback we need to refine and perfect your brand identity.'),

('mood_board',
 'Before we dive into the full designs, we''d love to share our mood board and direction. Could you review it and confirm this aligns with your vision? This helps us ensure we''re heading in the right direction before investing more time.'),

-- ── FEEDBACK & REVISION ───────────────────────────────────────
('feedback_request',
 'Could you share your feedback on the latest designs? Any thoughts — big or small — are incredibly helpful. The more specific you can be (e.g. "make the logo larger", "prefer cooler colors"), the faster we can nail it! 💬'),

('revision_received',
 'Thank you for your detailed feedback! We''ve noted all your revision requests and our team is working on the updated version now. We''ll have the revisions ready for your review shortly.'),

('revision_started',
 'We''ve started working on your revisions based on your feedback. Our team is making the adjustments and will have an updated version ready soon. Thank you for your patience! 🙏'),

('revision_limit',
 'Just a friendly reminder that your current package includes a set number of revision rounds. We want to make sure you use them wisely! If you''d like to discuss additional revisions, we''re happy to accommodate — just let us know.'),

('clarification',
 'Thank you for your feedback! We want to make sure we get this exactly right. Could you clarify a little more on this point? A reference image or a few more words of description would really help us nail your vision.'),

('direction_confirm',
 'Perfect! We''re really glad you love that direction. We''ll focus all our energy on refining and developing it further. The next round of revisions will bring this to life even more — stay tuned! 🎯'),

-- ── PROGRESS UPDATES ─────────────────────────────────────────
('update',
 'Quick project update: our team is currently working on your designs and everything is progressing well. We''re on track with the timeline and will share the next round with you shortly. Thank you for your patience!'),

('stage_advance',
 'Great milestone! 🏆 Your project has advanced to the next stage. We''re making excellent progress and the final result is really coming together beautifully. Keep an eye on your dashboard for the latest updates.'),

('timeline',
 'Your project is progressing on schedule. Based on our current timeline, you can expect the next delivery within the agreed timeframe. We''ll notify you as soon as it''s ready for review.'),

('delay',
 'We want to be transparent with you — we''re experiencing a brief delay on our end to ensure the quality meets our standards. We apologize for any inconvenience and appreciate your patience. The updated delivery will be worth the wait! 🙏'),

('almost_done',
 'The finish line is in sight! 🏁 We''re in the final stages of polishing your deliverables. Just a little more time and we''ll be ready to share the final results with you.'),

-- ── FILE DELIVERY & REVIEW ───────────────────────────────────
('files_ready',
 'Your files are now available in the Files section of your dashboard! 📁 Please review them and let us know if everything looks good. Once you''ve approved, we''ll prepare the final export package.'),

('final_files',
 'Your final deliverable files have been uploaded! 🎉 All formats are included as per your package. Please review everything carefully and confirm your approval so we can officially close out this project.'),

('file_formats',
 'Your deliverables include all standard formats: vector files (AI, EPS), print-ready PDFs, and web-optimized PNGs/SVGs. If you need any additional formats or sizes, just let us know and we''ll be happy to provide them.'),

('approval_request',
 'Could you take a moment to review the latest files and share your approval? Once we have your sign-off, we''ll be able to finalize and package everything up for you. We''re almost there! ✅'),

('approved',
 'Wonderful! 🎊 Your approval has been noted. We''re now preparing the final export package with all your files in the agreed formats. You''ll receive everything shortly. It''s been a pleasure working with you!'),

-- ── COMPLETION & HANDOFF ─────────────────────────────────────
('complete',
 'Your project is now officially complete! 🎉 It has been an absolute pleasure working with you. Your final files are ready in the dashboard. We hope the results exceed your expectations and we look forward to working together again!'),

('handoff',
 'The project handoff is complete! All final files, source documents, and assets have been uploaded to your dashboard. Please make sure to download and back up your files. Don''t hesitate to reach out if you ever need anything in the future. 🤝'),

('testimonial',
 'We''re so glad the project turned out well! If you''re happy with the results, we''d be truly grateful if you could share a short testimonial or review. Your feedback means the world to us and helps other clients discover our work. 💙'),

('referral',
 'Thank you so much for being an amazing client! If you know anyone who could benefit from our branding services, we''d love an introduction. We offer a referral discount as a thank you. 🌟'),

-- ── GENERAL COMMUNICATION ────────────────────────────────────
('hello',
 'Hello! 👋 Thanks for reaching out. How can we help you today?'),

('brb',
 'I''ll be back shortly! I just need a few minutes. I''ll reply as soon as I return. 🙏'),

('thanks',
 'Thank you so much for your message and for your patience! We really appreciate working with you. 😊'),

('review',
 'Please review the latest deliverables in the Files tab above and let us know your thoughts. We''re looking forward to your feedback!'),

('follow_up',
 'Just following up on our previous message — have you had a chance to review the latest designs? No rush, just wanted to make sure everything reached you! 😊'),

('ooo',
 'I''m currently out of the office but will be back on [date]. Your project is in good hands and our team will keep things moving. I''ll respond to your message as soon as I return!'),

('urgent',
 'Message received! We understand this is time-sensitive and our team is prioritizing your request right now. We''ll get back to you as quickly as possible. Thank you for flagging this.'),

('question',
 'Great question! Let me look into this and get back to you with a detailed answer shortly. We want to make sure we give you the most accurate information possible.'),

('payment_reminder',
 'Just a friendly reminder that the next project milestone payment is now due. You can process this through your preferred payment method. Please let us know if you have any questions about your invoice. Thank you! 💳'),

('meeting',
 'We''d love to schedule a quick call to discuss the project in more detail. Please let us know your availability and preferred time zone and we''ll set something up right away!')

ON CONFLICT (shortcut) DO UPDATE
  SET response_text = EXCLUDED.response_text;
