export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  linkUrl?: string;
  linkLabel?: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'shipping-time',
    question: 'How long will it take to receive my order?',
    answer:
      'Standard shipping typically takes 3-5 business days. Expedited shipping options are available at checkout and usually arrive within 1-2 business days.',
    category: 'Ordering & Shipping',
    keywords: ['shipping', 'delivery', 'time', 'transit', 'expedited', 'standard', 'days'],
  },
  {
    id: 'track-order',
    question: 'How can I track my order?',
    answer:
      'Once your order ships, you will receive an email with carrier tracking details. You can also view live milestone updates anytime using our online tracker.',
    category: 'Ordering & Shipping',
    keywords: ['track', 'tracking', 'order', 'status', 'milestones', 'fedex', 'shipment', 'lookup'],
    linkUrl: '/track',
    linkLabel: 'Track your order online',
  },
  {
    id: 'shipping-international',
    question: 'Do you ship internationally?',
    answer:
      'Currently, we only ship within the United States, including Alaska and Hawaii. We are working on expanding our shipping options to international customers in the near future.',
    category: 'Ordering & Shipping',
    keywords: ['international', 'worldwide', 'global', 'shipping', 'canada', 'destinations'],
  },
  {
    id: 'return-policy',
    question: 'What is your return policy?',
    answer:
      'We offer a 30-day return policy for all unused items in their original packaging with tags attached. Reach out to our customer support team to initiate a return.',
    category: 'Returns & Refunds',
    keywords: ['return', 'policy', '30 days', 'refund', 'exchange', 'unused', 'packaging'],
  },
  {
    id: 'return-item',
    question: 'How do I return an item?',
    answer:
      'To return an item, visit your order history and select "Return Item" or contact our support team for a prepaid return shipping label and instructions.',
    category: 'Returns & Refunds',
    keywords: ['return', 'item', 'label', 'shipping', 'process', 'order history', 'support'],
  },
  {
    id: 'refund-timing',
    question: 'When will I get my refund?',
    answer:
      'Refunds are processed within 5-7 business days after we receive and inspect your returned item. The funds will be returned to your original payment method.',
    category: 'Returns & Refunds',
    keywords: ['refund', 'timing', 'funds', 'payment', 'money', 'business days', 'credit card'],
  },
  {
    id: 'product-warranty',
    question: 'Do Contoso products come with a warranty?',
    answer:
      'Yes, all Contoso Outdoors technical gear, packs, and tents come with a limited lifetime warranty covering manufacturing defects in materials and craftsmanship.',
    category: 'Product Care & Warranty',
    keywords: ['warranty', 'guarantee', 'lifetime', 'defects', 'craftsmanship', 'repair', 'replacement'],
  },
  {
    id: 'tent-care',
    question: 'How do I clean and care for waterproof tents?',
    answer:
      'Clean your tent by hand using lukewarm water, a non-detergent technical soap, and a soft sponge. Allow it to air-dry completely before storing in a cool, dry place.',
    category: 'Product Care & Warranty',
    keywords: ['tent', 'clean', 'care', 'waterproof', 'washing', 'maintenance', 'sponge', 'storage'],
  },
  {
    id: 'rewards-program',
    question: 'Do you have a rewards program?',
    answer:
      'Yes! Contoso Trail Rewards members earn points on every purchase, get early access to limited gear drops, and receive annual member dividends.',
    category: 'Account & Membership',
    keywords: ['rewards', 'membership', 'points', 'loyalty', 'dividend', 'discounts', 'account'],
  },
  {
    id: 'shipping-address',
    question: 'How do I update my shipping address?',
    answer:
      'You can update your default shipping address in your profile under the Shipping tab, or enter a different shipping address during checkout.',
    category: 'Account & Membership',
    keywords: ['address', 'shipping', 'profile', 'update', 'change', 'account', 'checkout'],
  },
];

export function getAllFaqs(): FaqItem[] {
  return FAQ_ITEMS;
}

export function getFaqCategories(): string[] {
  const categories: string[] = [];
  for (const item of FAQ_ITEMS) {
    if (!categories.includes(item.category)) {
      categories.push(item.category);
    }
  }
  return categories;
}

export function filterFaqs(query: string, category?: string): FaqItem[] {
  const trimmedQuery = query.trim().toLowerCase();
  const normalizedCategory = category?.trim().toLowerCase();

  return FAQ_ITEMS.filter((item) => {
    // Check category match
    if (normalizedCategory && normalizedCategory !== 'all') {
      if (item.category.toLowerCase() !== normalizedCategory) {
        return false;
      }
    }

    // If query is empty, return all matching the category
    if (!trimmedQuery) {
      return true;
    }

    // Check question match
    if (item.question.toLowerCase().includes(trimmedQuery)) {
      return true;
    }

    // Check answer match
    if (item.answer.toLowerCase().includes(trimmedQuery)) {
      return true;
    }

    // Check keywords match
    if (item.keywords.some((kw) => kw.toLowerCase().includes(trimmedQuery))) {
      return true;
    }

    return false;
  });
}
