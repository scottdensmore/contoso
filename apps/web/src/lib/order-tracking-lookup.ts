export type MilestoneStatus = 'completed' | 'current' | 'upcoming';

export interface TrackingMilestone {
  id: string;
  name: string;
  description: string;
  date?: string;
  status: MilestoneStatus;
}

export interface OrderTrackingResult {
  orderId: string;
  orderDate: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  currentLocation: string;
  shippingAddress: {
    name: string;
    city: string;
    state: string;
    zipCode: string;
  };
  milestones: TrackingMilestone[];
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  total: number;
}

interface DemoOrderRecord {
  orderId: string;
  orderDate: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  currentLocation: string;
  shippingAddress: {
    name: string;
    city: string;
    state: string;
    zipCode: string;
  };
  email: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  total: number;
  milestoneDates?: {
    placed?: string;
    processing?: string;
    shipped?: string;
    outForDelivery?: string;
    delivered?: string;
  };
}

const DEMO_ORDERS: DemoOrderRecord[] = [
  {
    orderId: 'CTSO-98765',
    orderDate: 'October 14, 2026',
    status: 'Shipped',
    carrier: 'FedEx Ground',
    trackingNumber: 'FX-9876543210',
    estimatedDelivery: 'October 18, 2026',
    currentLocation: 'Portland, OR Distribution Center',
    shippingAddress: {
      name: 'Sarah Connor',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
    },
    email: 'sarah.connor@example.com',
    items: [
      {
        id: 'item-1',
        name: 'Cascade Mountain Backpack 45L',
        quantity: 1,
        price: 149.99,
        imageUrl: '/products/backpack.jpg',
      },
      {
        id: 'item-2',
        name: 'Trail Ridge Carbon Trekking Poles',
        quantity: 1,
        price: 59.99,
        imageUrl: '/products/poles.jpg',
      },
    ],
    total: 209.98,
    milestoneDates: {
      placed: 'Oct 14, 2026 09:30 AM',
      processing: 'Oct 15, 2026 11:15 AM',
      shipped: 'Oct 16, 2026 04:45 PM',
    },
  },
  {
    orderId: 'ord_123',
    orderDate: 'October 10, 2026',
    status: 'Delivered',
    carrier: 'UPS Ground',
    trackingNumber: '1Z999AA10123456784',
    estimatedDelivery: 'October 13, 2026',
    currentLocation: 'Delivered - Front Porch, Portland, OR',
    shippingAddress: {
      name: 'Alex Johnson',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
    },
    email: 'alex@example.com',
    items: [
      {
        id: 'item-3',
        name: 'Alpine 3-Season 2-Person Tent',
        quantity: 1,
        price: 289.00,
        imageUrl: '/products/tent.jpg',
      },
    ],
    total: 289.00,
    milestoneDates: {
      placed: 'Oct 10, 2026 02:14 PM',
      processing: 'Oct 11, 2026 08:30 AM',
      shipped: 'Oct 11, 2026 06:20 PM',
      outForDelivery: 'Oct 13, 2026 07:45 AM',
      delivered: 'Oct 13, 2026 01:15 PM',
    },
  },
  {
    orderId: 'CTSO-TRK-DEMO123',
    orderDate: 'October 15, 2026',
    status: 'Out for Delivery',
    carrier: 'FedEx Express',
    trackingNumber: 'FX-1122334455',
    estimatedDelivery: 'Today by 5:00 PM',
    currentLocation: 'On delivery vehicle, Denver, CO',
    shippingAddress: {
      name: 'Jordan Miller',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
    },
    email: 'jordan@example.com',
    items: [
      {
        id: 'item-4',
        name: 'Stormproof Hydro Shell Jacket',
        quantity: 1,
        price: 195.00,
        imageUrl: '/products/jacket.jpg',
      },
    ],
    total: 195.00,
    milestoneDates: {
      placed: 'Oct 15, 2026 10:00 AM',
      processing: 'Oct 15, 2026 03:00 PM',
      shipped: 'Oct 16, 2026 02:00 AM',
      outForDelivery: 'Oct 16, 2026 08:15 AM',
    },
  },
  {
    orderId: 'CTSO-PROCESSING',
    orderDate: 'October 16, 2026',
    status: 'Processing',
    carrier: 'UPS Ground',
    trackingNumber: 'Pending Carrier Assignment',
    estimatedDelivery: 'Pending (Est. 3-5 business days)',
    currentLocation: 'Fulfillment Center, Seattle, WA',
    shippingAddress: {
      name: 'Taylor Swift',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
    },
    email: 'taylor@example.com',
    items: [
      {
        id: 'item-5',
        name: 'Merino Wool Trail Socks (3-Pack)',
        quantity: 2,
        price: 34.00,
        imageUrl: '/products/socks.jpg',
      },
    ],
    total: 68.00,
    milestoneDates: {
      placed: 'Oct 16, 2026 11:30 AM',
      processing: 'Oct 16, 2026 01:00 PM',
    },
  },
  {
    orderId: 'CTSO-CANCELLED',
    orderDate: 'October 12, 2026',
    status: 'Cancelled',
    carrier: 'N/A',
    trackingNumber: 'N/A',
    estimatedDelivery: 'Order Cancelled',
    currentLocation: 'Cancelled by customer request',
    shippingAddress: {
      name: 'Morgan Lee',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
    },
    email: 'morgan@example.com',
    items: [
      {
        id: 'item-6',
        name: 'Campfire Portable Stove',
        quantity: 1,
        price: 89.99,
        imageUrl: '/products/stove.jpg',
      },
    ],
    total: 89.99,
    milestoneDates: {
      placed: 'Oct 12, 2026 08:00 AM',
    },
  },
];

function buildMilestones(
  status: OrderTrackingResult['status'],
  dates?: DemoOrderRecord['milestoneDates']
): TrackingMilestone[] {
  const milestoneDefs: Array<{
    id: string;
    name: string;
    description: string;
    date?: string;
  }> = [
    {
      id: 'order-placed',
      name: 'Order Placed',
      description: 'Your order has been confirmed and received.',
      date: dates?.placed,
    },
    {
      id: 'processing',
      name: 'Processing',
      description: 'Items are being picked and packed at our warehouse.',
      date: dates?.processing,
    },
    {
      id: 'shipped',
      name: 'Shipped & In Transit',
      description: 'Package has left the facility and is on its way.',
      date: dates?.shipped,
    },
    {
      id: 'out-for-delivery',
      name: 'Out for Delivery',
      description: 'Package is on the local delivery vehicle.',
      date: dates?.outForDelivery,
    },
    {
      id: 'delivered',
      name: 'Delivered',
      description: 'Package delivered to the destination.',
      date: dates?.delivered,
    },
  ];

  let currentIdx = -1;
  switch (status) {
    case 'Processing':
      currentIdx = 1;
      break;
    case 'Shipped':
      currentIdx = 2;
      break;
    case 'Out for Delivery':
      currentIdx = 3;
      break;
    case 'Delivered':
      currentIdx = 4;
      break;
    case 'Cancelled':
      currentIdx = -1;
      break;
  }

  return milestoneDefs.map((def, idx) => {
    let milestoneStatus: MilestoneStatus;
    if (status === 'Cancelled') {
      milestoneStatus = idx === 0 ? 'completed' : 'upcoming';
    } else if (status === 'Delivered') {
      milestoneStatus = 'completed';
    } else if (idx < currentIdx) {
      milestoneStatus = 'completed';
    } else if (idx === currentIdx) {
      milestoneStatus = 'current';
    } else {
      milestoneStatus = 'upcoming';
    }

    return {
      ...def,
      status: milestoneStatus,
    };
  });
}

/**
 * Deterministic order tracking resolver.
 * Looks up demo and known orders by order ID and postal code or email address.
 */
export function lookupOrderTracking(
  orderId: string,
  postalCodeOrEmail: string
): OrderTrackingResult | null {
  if (!orderId || !postalCodeOrEmail) {
    return null;
  }

  const cleanOrderId = orderId.trim().replace(/^#+/, '').toUpperCase();
  const cleanInput = postalCodeOrEmail.trim().toLowerCase();

  if (!cleanOrderId || !cleanInput) {
    return null;
  }

  const found = DEMO_ORDERS.find(
    (order) => order.orderId.toUpperCase() === cleanOrderId
  );

  if (!found) {
    return null;
  }

  const matchesZip =
    found.shippingAddress.zipCode.toLowerCase() === cleanInput ||
    found.shippingAddress.zipCode.slice(0, 5) === cleanInput.slice(0, 5);

  const matchesEmail = found.email.toLowerCase() === cleanInput;

  if (!matchesZip && !matchesEmail) {
    return null;
  }

  return {
    orderId: found.orderId,
    orderDate: found.orderDate,
    status: found.status,
    carrier: found.carrier,
    trackingNumber: found.trackingNumber,
    estimatedDelivery: found.estimatedDelivery,
    currentLocation: found.currentLocation,
    shippingAddress: { ...found.shippingAddress },
    milestones: buildMilestones(found.status, found.milestoneDates),
    items: found.items.map((item) => ({ ...item })),
    total: found.total,
  };
}
