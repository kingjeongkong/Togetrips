import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { supportType, subject, description, userEmail } = await request.json();

    // 필수 필드 검증
    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 });
    }

    // 이메일 전송기 생성
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 이메일 내용 구성
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">New Support Request - Togetrips</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Request Details</h3>
          
          <p><strong>Type:</strong> ${supportType}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>User Email:</strong> ${userEmail || 'Not provided'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #333;">Description</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${description}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 8px;">
          <p style="margin: 0; color: #0066cc; font-size: 14px;">
            This support request was submitted through the Togetrips application.
          </p>
        </div>
      </div>
    `;

    // 이메일 전송
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
      subject: `[Togetrips Support] ${subject}`,
      html: emailContent,
      replyTo: userEmail || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Support request sent successfully',
    });
  } catch (error) {
    console.error('Support email error:', error);

    return NextResponse.json(
      {
        error: 'Failed to send support request',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 },
    );
  }
}
