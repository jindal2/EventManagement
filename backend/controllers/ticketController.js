import PDFDocument from "pdfkit";
import { pool } from "../index.js";

export const downloadTicket = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    const eventRes = await pool.query(
      `SELECT title, organizer_id, event_date, event_time, venue, image
       FROM events WHERE id = $1`,
      [eventId]
    );

    if (eventRes.rows.length === 0) {
      return res.status(404).json({ msg: "Event not found" });
    }

    const event = eventRes.rows[0];

    const orgRes = await pool.query(
      `SELECT name FROM users WHERE id = $1`,
      [event.organizer_id]
    );

    const organizerName = orgRes.rows[0]?.name || "Organizer";

    const userRes = await pool.query(
      `SELECT name FROM users WHERE id = $1`,
      [userId]
    );

    const attendeeName = userRes.rows[0]?.name || "Attendee";

    const doc = new PDFDocument({
      size: [600, 350], // custom ticket size
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ticket_${event.title.replace(/\s+/g, "_")}.pdf"`
    );

    doc.pipe(res);

    // Background
    doc.rect(0, 0, 600, 350).fill("#0f1117");

    // Left accent bar
    doc.rect(0, 0, 20, 350).fill("#6366f1");

    // Ticket Header
    doc.fillColor("#ffffff").fontSize(28).text("EVENT TICKET", 50, 40, { tracking: 4 });

    // Decorative Line
    doc.moveTo(50, 80).lineTo(550, 80).lineWidth(1).strokeColor("#334155").stroke();

    // Event Title
    doc.fillColor("#a5b4fc").fontSize(24).text(event.title, 50, 100, { width: 350 });

    const formattedDate = new Date(event.event_date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const formattedTime = event.event_time
      ? new Date(`1970-01-01T${event.event_time}`).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

    // Details Grid
    let startY = 160;
    
    // Attendee
    doc.fillColor("#64748b").fontSize(12).text("ATTENDEE", 50, startY);
    doc.fillColor("#ffffff").fontSize(16).text(attendeeName, 50, startY + 15);

    // Organizer
    doc.fillColor("#64748b").fontSize(12).text("ORGANIZER", 250, startY);
    doc.fillColor("#ffffff").fontSize(16).text(organizerName, 250, startY + 15);

    startY += 60;

    // Date & Time
    doc.fillColor("#64748b").fontSize(12).text("DATE & TIME", 50, startY);
    doc.fillColor("#ffffff").fontSize(16).text(`${formattedDate} • ${formattedTime}`, 50, startY + 15);

    // Venue
    doc.fillColor("#64748b").fontSize(12).text("LOCATION", 250, startY);
    doc.fillColor("#ffffff").fontSize(16).text(event.venue || "TBA", 250, startY + 15, { width: 300 });

    // Barcode area (mock)
    doc.rect(450, 100, 100, 100).fill("#ffffff");
    // Draw some lines for barcode
    for (let i = 0; i < 20; i++) {
        const w = Math.random() * 4 + 1;
        doc.rect(455 + (i * 4.5), 105, w, 90).fill("#000000");
    }

    doc.fillColor("#64748b").fontSize(10).text(`TKT-${eventId}-${userId}-VALID`, 450, 210, { align: 'center', width: 100 });

    // Cutout circles to look like a ticket
    doc.circle(20, 175, 15).fill("#ffffff");
    doc.circle(600, 175, 15).fill("#ffffff");

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
