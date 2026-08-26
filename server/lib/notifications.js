import { run } from '../db.js';

export async function createNotification({ type, title, body, link = null }) {
  await run(
    `INSERT INTO admin_notifications (type, title, body, link) VALUES ($1, $2, $3, $4)`,
    [type, title, body, link],
  );
}

export async function notifyNewCustomer(customer) {
  await createNotification({
    type:  'new_customer',
    title: 'New customer joined',
    body:  `${customer.name} (${customer.email}) just created an account.`,
    link:  '/admin/customers',
  });
}
