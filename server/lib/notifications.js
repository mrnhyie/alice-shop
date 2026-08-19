import db from '../db.js';

export function createNotification({ type, title, body, link = null }) {
  db.prepare(`
    INSERT INTO admin_notifications (type, title, body, link)
    VALUES (?, ?, ?, ?)
  `).run(type, title, body, link);
}

export function notifyNewCustomer(customer) {
  createNotification({
    type: 'new_customer',
    title: 'New customer joined',
    body: `${customer.name} (${customer.email}) just created an account.`,
    link: '/admin/customers',
  });
}
