// ─── Products and orders now live in SQLite (server/alice.db).
// ─── Fetch them via /api/products and /api/orders.
// ─── Only static reference / UI data lives here.

export const products = [];      // empty – all products come from the DB
export const recentOrders = [];  // empty – all orders come from the DB

// Category reference (used for filter labels / admin selects)
export const categories = [
  { id: 'clothing',    name: 'Clothing',    count: 0 },
  { id: 'bags',        name: 'Bags',        count: 0 },
  { id: 'jewelry',     name: 'Jewelry',     count: 0 },
  { id: 'accessories', name: 'Accessories', count: 0 },
];

// Static testimonials (not stored in DB)
export const testimonials = [
  {
    id: 1,
    name: 'Adaeze Nwosu',
    location: 'Lagos, Nigeria',
    rating: 5,
    text: 'The Kente Maxi Dress I ordered is absolutely breathtaking. The colour and fit are extraordinary — it makes every outing feel special. Alice truly carries culture with you.',
    avatar: 'AN',
  },
  {
    id: 2,
    name: 'Kofi Agyemang',
    location: 'Accra, Ghana',
    rating: 5,
    text: 'I gifted my mother the Mudcloth Tote Bag for her birthday and she was moved to tears. It reminded her of home. The quality is unmatched and delivery was faster than expected.',
    avatar: 'KA',
  },
  {
    id: 3,
    name: 'Mariame Touré',
    location: "Abidjan, Côte d'Ivoire",
    rating: 5,
    text: 'Shopping at Alice feels like a cultural journey. The Beaded Collar Necklace I bought is a conversation starter everywhere I wear it. I love bringing this energy into my wardrobe.',
    avatar: 'MT',
  },
];

// Static monthly chart data for the dashboard revenue chart
// Replace with real DB aggregations once you have order history.
export const salesData = [
  { month: 'Jan', revenue: 0, orders: 0 },
  { month: 'Feb', revenue: 0, orders: 0 },
  { month: 'Mar', revenue: 0, orders: 0 },
  { month: 'Apr', revenue: 0, orders: 0 },
  { month: 'May', revenue: 0, orders: 0 },
  { month: 'Jun', revenue: 0, orders: 0 },
  { month: 'Jul', revenue: 0, orders: 0 },
  { month: 'Aug', revenue: 0, orders: 0 },
  { month: 'Sep', revenue: 0, orders: 0 },
  { month: 'Oct', revenue: 0, orders: 0 },
  { month: 'Nov', revenue: 0, orders: 0 },
  { month: 'Dec', revenue: 0, orders: 0 },
];
