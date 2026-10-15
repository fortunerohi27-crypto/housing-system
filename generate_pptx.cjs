const pptxgen = require('pptxgenjs');

const pres = new pptxgen();

// Set global theme colors
const COLORS = {
    PRIMARY: '1E293B', // Slate 800
    SECONDARY: '334155', // Slate 700
    ACCENT: '3B82F6', // Blue 500
    TEXT: 'F8FAFC', // Slate 50
    LIGHT_TEXT: 'CBD5E1' // Slate 300
};

// 1. Title Slide
const slide1 = pres.addSlide();
slide1.background = { fill: COLORS.PRIMARY };
slide1.addText('Housing Management System', {
    x: 0, y: '35%', w: '100%', align: 'center',
    fontSize: 44, bold: true, color: COLORS.TEXT
});
slide1.addText('A Comprehensive Digital Brain for Rental Property Businesses', {
    x: 0, y: '50%', w: '100%', align: 'center',
    fontSize: 24, color: COLORS.LIGHT_TEXT
});

// 2. What is this?
const slide2 = pres.addSlide();
slide2.addText('What is this system?', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide2.addText([
    { text: 'A "Digital Control Center" that replaces messy paperwork and spreadsheets.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Connects the dots between properties, tenants, money, and repairs.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Goal: Ensure no payment is missed, no leak is ignored, and no contract is lost.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 3. Dual-Sided Approach
const slide3 = pres.addSlide();
slide3.addText('Two Perspectives, One System', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide3.addText([
    { text: 'The Manager\'s Dashboard:', options: { bullet: false, fontSize: 22, bold: true, color: COLORS.PRIMARY, marginB: 10 } },
    { text: 'Full operational power. Managing everything from profits to plumbing.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY, indent: 20 } },
    { text: 'The Tenant\'s Portal:', options: { bullet: false, fontSize: 22, bold: true, color: COLORS.PRIMARY, marginB: 10 } },
    { text: 'A private self-service area. Pay rent and request repairs without the phone calls.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY, indent: 20 } },
], { x: 0.5, y: 1.5, w: '90%' });

// 4. Property & Unit Management
const slide4 = pres.addSlide();
slide4.addText('Organizing Your Assets', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide4.addText([
    { text: 'Hierarchy: Property (Building) $\rightarrow$ Unit (Room/Apartment).', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Real-Time Status Tracking:', options: { bullet: false, fontSize: 22, bold: true, color: COLORS.PRIMARY, marginB: 10 } },
    { text: 'Vacant: Ready for rent.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY, indent: 20 } },
    { text: 'Occupied: Tenant is currently living there.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY, indent: 20 } },
    { text: 'Under Maintenance: Currently being repaired.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY, indent: 20 } },
    { text: 'Notice Given: Tenant is leaving soon.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY, indent: 20 } },
], { x: 0.5, y: 1.5, w: '90%' });

// 5. Tenant Onboarding
const slide5 = pres.addSlide();
slide5.addText('Smart Tenant Management', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide5.addText([
    { text: 'More than just a name—a complete security profile:', options: { bullet: false, fontSize: 22, bold: true, color: COLORS.PRIMARY, marginB: 10 } },
    { text: 'Verification: Store job positions and monthly income to ensure affordability.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Safety: Keep emergency contacts (name/phone/rel) for every renter.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Records: Track pets, roommates, and important legal IDs.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 6. The Life of a Lease
const slide6 = pres.addSlide();
slide6.addText('The Lease Lifecycle', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide6.addText([
    { text: 'Start: Log move-in date, rent amount, and security deposits.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Middle: Manage "Addendums" (new rules) and official "Notices."', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'End: Calculate the "Deposit Refund"—tracking deductions for damages.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Automation: Set the exact day of the month rent is due.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 7. Money Flow 1: Rent & Invoicing
const slide7 = pres.addSlide();
slide7.addText('Money Flow: Rent Collection', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide7.addText([
    { text: 'Invoicing: The system creates a digital "Bill" with a due date.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Payment Tracking: Log the exact method (Cash, Transfer) and receipt number.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Late Fees: Automatically track and add fees for overdue payments.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 8. Money Flow 2: Expenses & Profit
const slide8 = pres.addSlide();
slide8.addText('Money Flow: Profitability', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide8.addText([
    { text: 'Expense Logging: Every dollar spent on taxes, insurance, or repairs is tracked.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'The Calculation: Rent Revenue - Expenses = Net Profit.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Property Insights: See which building is making money and which is costing too much.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 9. Maintenance 1: The Journey
const slide9 = pres.addSlide();
slide9.addText('Maintenance: The Journey', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide9.addText([
    { text: 'Step 1: Tenant submits a "Ticket" (e.g., "Leaking Sink").', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Step 2: Manager assigns a Priority (Low, Med, High).', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Step 3: Manager chooses a Vendor (e.g., "Plumber Joe").', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Step 4: Job is marked "Resolved" once fixed.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 10. Maintenance 2: Prevention
const slide10 = pres.addSlide();
slide10.addText('Preventive Care & Vendors', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide10.addText([
    { text: 'Stop Problems Before They Start: Schedule recurring tasks (e.g., AC filter changes).', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Vendor Directory: A a complete list of trusted tradespeople (electricians, painters, etc).', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Asset Longevity: Regular upkeep means fewer expensive emergency repairs.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 11. Professional Tools
const slide11 = pres.addSlide();
slide11.addText('Professional Tools', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide11.addText([
    { text: 'Announcements: Send one message to all tenants at once.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Audit Logs: A digital "Security Camera" that records who changed what and when.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Digital Filing Cabinet: Store PDFs and photos of contracts and IDs.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 12. The Tenant Portal
const slide12 = pres.addSlide();
slide12.addText('The Tenant Portal', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide12.addText([
    { text: 'Self-Service Payments: View current bills and payment history.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Request Help: Submit a repair ticket and track its progress from a phone.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Digital Lease: Access the contract rules without calling the landlord.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Direct Line: Messaging thread for clear communication with the manager.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 13. Tech Side
const slide13 = pres.addSlide();
slide13.addText('How it\'s Built (Simple)', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide13.addText([
    { text: 'React: Makes the app feel "snappy" (no page reloads).', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Tailwind CSS: Ensures it looks professional on both desktops and mobile phones.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Vite: The "fast-forward" button for building the app.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 14. Permission Matrix
const slide14 = pres.addSlide();
slide14.addText('Who Sees What?', {
    x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: COLORS.PRIMARY
});
slide14.addText([
    { text: 'The Manager: Full access to everything (Money, All Tenants, All Houses).', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'The Tenant: Restricted access (Only their own bills, lease, and requests).', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
    { text: 'Role-Based Security: The system checks your "key" (role) before letting you in.', options: { bullet: true, fontSize: 20, color: COLORS.SECONDARY } },
], { x: 0.5, y: 1.5, w: '90%' });

// 15. Conclusion
const slide15 = pres.addSlide();
slide15.background = { fill: COLORS.PRIMARY };
slide15.addText('Thank You!', {
    x: 0, y: '35%', w: '100%', align: 'center',
    fontSize: 44, bold: true, color: COLORS.TEXT
});
slide15.addText('Questions & Answers', {
    x: 0, y: '50%', w: '100%', align: 'center',
    fontSize: 24, color: COLORS.LIGHT_TEXT
});

pres.writeFile({ fileName: 'Housing_Management_System_Presentation.pptx' })
    .then(fileName => console.log(`Presentation created: ${fileName}`))
    .catch(err => console.error(err));
