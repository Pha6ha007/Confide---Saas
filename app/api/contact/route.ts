import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { checkIpRateLimit, rateLimitResponse } from "@/lib/utils/ip-rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["general", "partnership"]),
  subject: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  partnershipType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 submissions per 10 minutes per IP
    const rl = checkIpRateLimit(request, {
      limit: 5,
      windowSeconds: 600,
      endpoint: "/api/contact",
    });
    if (!rl.success) return rateLimitResponse(rl);

    const body = await request.json();

    // Validate input
    const validatedData = contactSchema.parse(body);

    const { name, email, message, type, subject: userSubject, company, role, partnershipType } = validatedData;

    // Prepare email content
    const emailSubject = type === "partnership" && company
      ? `[Confide Partnership] ${company}`
      : `[Confide Contact] ${name}`;

    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Type:</strong> ${type === "partnership" ? "Partnership Inquiry" : "General Inquiry"}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${userSubject ? `<p><strong>Subject:</strong> ${userSubject}</p>` : ""}
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
      ${role ? `<p><strong>Role:</strong> ${role}</p>` : ""}
      ${partnershipType ? `<p><strong>Partnership Type:</strong> ${partnershipType}</p>` : ""}
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `;

    // Send email via Resend
    await resend.emails.send({
      from: "Confide Contact Form <noreply@confide.app>",
      to: "hello@confide.app",
      replyTo: email,
      subject: emailSubject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
