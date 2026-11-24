
import nodemailer from "nodemailer";
console.log("EMAIL_USER loaded:", !!process.env.EMAIL_USER);
console.log("EMAIL_APP_PASSWORD loaded:", !!process.env.EMAIL_APP_PASSWORD);
import QRCode from "qrcode";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});


export const sendBookingConfirmation = async (
    email: string,
    attendeeName: string,
    eventName: string,
    ticketCount: number,
    ticketCodes: string[]
  ) => {
    const attachments = await Promise.all(
      ticketCodes.map(async (ticketCode, index) => ({
        filename: `Eventra-Ticket-${index + 1}.png`,
        content: await QRCode.toBuffer(ticketCode, {
          type: "png",
          width: 300,
          margin: 2,
        }),
        contentType: "image/png",
        cid: `ticket-${index + 1}`,
      }))
    );
  
    const ticketImages = ticketCodes
      .map(
        (_, index) => `
          <div style="margin: 24px 0; text-align: center;">
            <h3>Ticket ${index + 1}</h3>
            <img
              src="cid:ticket-${index + 1}"
              alt="Ticket QR Code ${index + 1}"
              width="220"
              height="220"
            />
            <p>Please present this QR code at the event entrance.</p>
          </div>
        `
      )
      .join("");
  
    await transporter.sendMail({
      from: `"Eventra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Booking Confirmed - ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Your booking is confirmed!</h2>
          <p>Hi ${attendeeName},</p>
          <p>Your booking for <strong>${eventName}</strong> is successful.</p>
          <p>Number of tickets: <strong>${ticketCount}</strong></p>
          <h3>Your Entry QR Codes</h3>
          ${ticketImages}
          <p>Each QR code represents one ticket. Present it at the entrance for verification.</p>
          <p>Thank you for choosing Eventra!</p>
          <p>Team Eventra</p>
        </div>
      `,
      attachments,
    });
  };
  
  export const sendEventReminder = async (
    email: string,
    attendeeName: string,
    eventName: string,
    eventDate: Date,
    venue: string
  ) => {
    await transporter.sendMail({
      from: `"Eventra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Reminder: ${eventName} is tomorrow!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Your event is tomorrow!</h2>
          <p>Hi ${attendeeName},</p>
          <p>This is a friendly reminder about your upcoming event:</p>
          <h3>${eventName}</h3>
          <p><strong>Date:</strong> ${eventDate.toLocaleString()}</p>
          <p><strong>Venue:</strong> ${venue}</p>
          <p>We look forward to seeing you!</p>
          <p>Thank you for choosing Eventra.</p>
        </div>
      `,
    });
  };

  export const sendEventUpdateEmail = async (
    email: string,
    attendeeName: string,
    eventName: string,
    eventDate: Date,
    venue: string
  ) => {
    await transporter.sendMail({
      from: `"Eventra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Important Update: ${eventName}`,
      html: `
        <h2>Hello ${attendeeName}!</h2>
        <p>The details of an event you booked have been updated.</p>
        <h3>${eventName}</h3>
        <p><strong>New Date:</strong> ${new Date(eventDate).toLocaleString()}</p>
        <p><strong>New Venue:</strong> ${venue}</p>
        <p>Please check Eventra for the latest event details.</p>
        <p>Thank you,<br/>Team Eventra</p>
      `,
    });
  };

export default transporter;
