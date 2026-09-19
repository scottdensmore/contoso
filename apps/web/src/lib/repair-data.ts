export interface RepairService {
  id: string;
  name: string;
  category: 'Tents & Shelters' | 'Apparel & Outerwear' | 'Packs & Bags' | 'Winter Gear';
  basePrice: number;
  turnaroundDays: number;
  description: string;
  includedWork: string[];
  commonIssues: string[];
}

export interface RepairCareTip {
  id: string;
  title: string;
  category: string;
  summary: string;
  recommendation: string;
}

export interface RepairEstimate {
  serviceId: string;
  serviceName: string;
  fulfillmentMethod: 'in_store' | 'mail_in';
  basePrice: number;
  shippingFee: number;
  totalPrice: number;
  turnaroundDays: number;
  estimatedCompletionDate: string;
}

export const REPAIR_SERVICES: RepairService[] = [
  // Tents & Shelters
  {
    id: 'tent-seam-sealing',
    name: 'Seam Sealing & Waterproofing',
    category: 'Tents & Shelters',
    basePrice: 35,
    turnaroundDays: 4,
    description:
      'Complete factory-grade urethane seam resealing and rainfly hydrostatic recoating to stop water ingress in heavy downpours.',
    includedWork: [
      'Removal of flaking or degraded factory tape',
      'High-grade polyurethane seam sealant bonding',
      'Hydrostatic pressure leak verification',
    ],
    commonIssues: [
      'Flaking or chalky seam tape',
      'Rainfly seam water leaks',
      'Bathtub floor moisture seepage',
    ],
  },
  {
    id: 'tent-zipper-replacement',
    name: 'Zipper Slider & Coil Replacement',
    category: 'Tents & Shelters',
    basePrice: 25,
    turnaroundDays: 3,
    description:
      'Replacement of worn sliders, damaged coil teeth, and door zipper realignment to restore weatherproofing and insect protection.',
    includedWork: [
      'Worn slider extraction and replacement',
      'Continuous coil tooth realignment',
      'End stop reinforcing and silicone zipper lubrication',
    ],
    commonIssues: [
      'Zipper splitting open behind slider',
      'Stuck or off-track slider',
      'Broken zipper pull tabs',
    ],
  },
  {
    id: 'tent-mesh-patching',
    name: 'Mesh & Canopy Patching',
    category: 'Tents & Shelters',
    basePrice: 30,
    turnaroundDays: 4,
    description:
      'Precision micro-mesh reweaving and canopy ripstop tear patching with bonded, stormproof backing.',
    includedWork: [
      'No-See-Um micromesh patch fusion',
      'Reinforced perimeter stitch',
      'Elastic tension stress test',
    ],
    commonIssues: [
      'Mosquito mesh tears & punctures',
      'Branch and snag rips in canopy',
      'Rodent chew holes in tent walls',
    ],
  },
  {
    id: 'tent-pole-repair',
    name: 'Pole Splint & Shock Cord Re-stringing',
    category: 'Tents & Shelters',
    basePrice: 20,
    turnaroundDays: 2,
    description:
      'Replacement of splintered or bent aluminum pole sections, ferrule realignment, and marine-grade shock cord restringing.',
    includedWork: [
      'Internal elastic shock cord replacement',
      'Damaged aluminum pole section swap',
      'Ferrule crimp inspection and end-tip seating',
    ],
    commonIssues: [
      'Slack, stretched, or snapped shock cord',
      'Bent or fractured pole segments',
      'Loose or cracked ferrules',
    ],
  },

  // Apparel & Outerwear
  {
    id: 'apparel-dwr-reproofing',
    name: 'DWR Technical Reproofing',
    category: 'Apparel & Outerwear',
    basePrice: 30,
    turnaroundDays: 3,
    description:
      'Specialized detergent wash to remove dirt and body oils followed by heat-activated fluorocarbon-free water-repellent coating renewal.',
    includedWork: [
      'Deep technical fabric residue wash',
      'Uniform immersion DWR coating',
      'Controlled thermo-activation tumble cycle',
    ],
    commonIssues: [
      'Wet-out face fabric on shells',
      'Loss of water beading in rain',
      'Reduced breathability causing clamminess',
    ],
  },
  {
    id: 'apparel-down-tear-repair',
    name: 'Down Baffle & Shell Tear Repair',
    category: 'Apparel & Outerwear',
    basePrice: 40,
    turnaroundDays: 5,
    description:
      'Responsible Down Standard (RDS) cluster replenishing, tear bonding, and baffle stitching to restore thermal loft.',
    includedWork: [
      '800-fill power down cluster replenishment',
      'Color-matched ripstop nylon patch fusion',
      'Baffle wall seam reconstruction',
    ],
    commonIssues: [
      'Down feathers leaking from campfire ember holes',
      'Shell tears from branches or ski edges',
      'Blown baffle partition seams',
    ],
  },
  {
    id: 'apparel-zipper-replacement',
    name: 'Waterproof Zipper Replacement',
    category: 'Apparel & Outerwear',
    basePrice: 35,
    turnaroundDays: 4,
    description:
      'Complete extraction of defective weatherproof zippers and precision installation of genuine YKK AquaGuard water-resistant zippers.',
    includedWork: [
      'Careful seam unpicking without fabric tear',
      'Polyurethane-coated YKK AquaGuard zipper install',
      'Interior seam taping to preserve waterproof barrier',
    ],
    commonIssues: [
      'Delaminated water-resistant zipper film',
      'Separated front storm zippers',
      'Corroded saltwater slider pins',
    ],
  },

  // Packs & Bags
  {
    id: 'pack-zipper-restitch',
    name: 'Heavy-Duty Zipper Re-stitching',
    category: 'Packs & Bags',
    basePrice: 25,
    turnaroundDays: 4,
    description:
      'High-tension nylon thread re-stitching and bartack reinforcement along pack curve stress points.',
    includedWork: [
      'Degraded thread removal',
      'High-tensile bonded nylon thread double stitching',
      'Heavy stress point bartacking',
    ],
    commonIssues: [
      'Main compartment zipper pulling away from pack body',
      'Popped stitches along curvature',
      'Heavy load seam fraying',
    ],
  },
  {
    id: 'pack-buckle-replacement',
    name: 'Buckle & Webbing Strap Replacement',
    category: 'Packs & Bags',
    basePrice: 15,
    turnaroundDays: 2,
    description:
      'Installation of heavy-duty Duraflex hardware, replacement of cracked sternum sliders, and heat-sealed webbing repair.',
    includedWork: [
      'Broken buckle removal',
      'Heavy-duty Duraflex / ITW hardware fitting',
      'Webbing fray trimming and thermal edge sealing',
    ],
    commonIssues: [
      'Stepped-on or crushed hipbelt buckles',
      'Frayed load-lifter webbing',
      'Lost or broken sternum strap sliders',
    ],
  },
  {
    id: 'pack-frame-realignment',
    name: 'Internal Frame Re-alignment',
    category: 'Packs & Bags',
    basePrice: 30,
    turnaroundDays: 3,
    description:
      'Custom anatomical re-contouring of aluminum frame stays and composite lumbar sheet re-seating for balanced load transfer.',
    includedWork: [
      'Aluminum stay extraction & curvature tuning',
      'HDPE framesheet inspection and stay sleeve reinforcing',
      'Load distribution check on anatomical form',
    ],
    commonIssues: [
      'Bent internal stays from heavy baggage handling',
      'Uneven shoulder strap weight distribution',
      'Stay poking through lower pack sleeve',
    ],
  },

  // Winter Gear
  {
    id: 'winter-wax-edge-tune',
    name: 'Ski & Snowboard Hot Wax & Edge Sharpening',
    category: 'Winter Gear',
    basePrice: 45,
    turnaroundDays: 2,
    description:
      'Base cleaning, diamond stone edge deburring and precision bevel sharpening, finished with temperature-specific hand hot waxing.',
    includedWork: [
      'Base surface cleaning and brass brush scouring',
      'Side and base edge precision filing and detuning',
      'Iron hot wax application, scraping, and horsehair polish',
    ],
    commonIssues: [
      'Dull or rusted steel edges',
      'Dry, oxidized chalky bases',
      'Sluggish glide on groomed trails or powder',
    ],
  },
  {
    id: 'winter-ptex-base-repair',
    name: 'P-Tex Base Gouge Repair',
    category: 'Winter Gear',
    basePrice: 50,
    turnaroundDays: 4,
    description:
      'Core shot and deep rock gouge repair using metal grip primer, molten P-Tex extrusion, and flat structured scraping.',
    includedWork: [
      'Gouge cleaning and oxidization removal',
      'High-adhesion metal-grip bonding base layer',
      'Molten P-Tex weld filling, planar scraping, and structuring',
    ],
    commonIssues: [
      'Rock core shots exposing fiberglass or wood core',
      'Deep running surface scratches',
      'Edge adjacent base gouges',
    ],
  },
];

export const REPAIR_CARE_TIPS: RepairCareTip[] = [
  {
    id: 'tip-dwr-wash',
    title: 'DWR Wash-In & Reactivation',
    category: 'Apparel & Outerwear',
    summary:
      'Keep waterproof-breathable membranes repelling rain without degrading breathability.',
    recommendation:
      'Wash garments with technical outerwear wash (never standard household detergents or fabric softeners). Tumble dry on medium heat for 20 minutes to reactivate the factory DWR polymer chains.',
  },
  {
    id: 'tip-tent-drying',
    title: 'Proper Tent Drying to Prevent Mildew',
    category: 'Tents & Shelters',
    summary:
      'Protect polyurethane waterproof coatings and fabric seams from irreversible hydrolysis.',
    recommendation:
      'Never store tents damp or rolled up wet for more than 24 hours. Pitch your tent loosely in a shaded, well-ventilated indoor space until completely dry before long-term storage.',
  },
  {
    id: 'tip-zipper-lubricant',
    title: 'Zipper Cleaning & Lubrication',
    category: 'Packs & Bags',
    summary:
      'Extend the lifespan of heavy-duty and waterproof coil zippers in gritty environments.',
    recommendation:
      'Clean teeth regularly with an old soft toothbrush and fresh water to remove fine trail dust and salt spray. Apply a dry silicone lubricant or zipper wax stick periodically.',
  },
  {
    id: 'tip-down-storage',
    title: 'Off-Season Down Sleeping Bag Storage',
    category: 'Apparel & Outerwear',
    summary:
      'Preserve down loft, fill power, and baffle integrity over months of inactivity.',
    recommendation:
      'Store down sleeping bags uncompressed in a breathable cotton or mesh storage sack or hung full-length in a dry closet. Never keep down packed tightly in a compression stuff sack.',
  },
];

export function getAllRepairServices(): RepairService[] {
  return [...REPAIR_SERVICES];
}

export function getRepairServicesByCategory(category?: string): RepairService[] {
  if (!category || category.toLowerCase() === 'all') {
    return getAllRepairServices();
  }
  return REPAIR_SERVICES.filter(
    (s) => s.category.toLowerCase() === category.toLowerCase()
  );
}

export function calculateRepairEstimate(
  serviceId: string,
  fulfillmentMethod: 'in_store' | 'mail_in',
  fromDate: Date = new Date()
): RepairEstimate {
  const service = REPAIR_SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    throw new Error(`Repair service not found: ${serviceId}`);
  }

  const shippingFee = fulfillmentMethod === 'mail_in' ? 10 : 0;
  const totalPrice = service.basePrice + shippingFee;
  const turnaroundDays = service.turnaroundDays;

  // Calculate estimated completion date
  const completionDate = new Date(fromDate.getTime());
  completionDate.setDate(completionDate.getDate() + turnaroundDays);

  const estimatedCompletionDate = completionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    serviceId: service.id,
    serviceName: service.name,
    fulfillmentMethod,
    basePrice: service.basePrice,
    shippingFee,
    totalPrice,
    turnaroundDays,
    estimatedCompletionDate,
  };
}

export function filterRepairServices(
  query: string,
  category?: string
): RepairService[] {
  let list = getRepairServicesByCategory(category);

  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return list;
  }

  return list.filter((service) => {
    const nameMatch = service.name.toLowerCase().includes(cleanQuery);
    const descMatch = service.description.toLowerCase().includes(cleanQuery);
    const issuesMatch = service.commonIssues.some((issue) =>
      issue.toLowerCase().includes(cleanQuery)
    );
    const workMatch = service.includedWork.some((work) =>
      work.toLowerCase().includes(cleanQuery)
    );
    return nameMatch || descMatch || issuesMatch || workMatch;
  });
}

export function getAllRepairCareTips(): RepairCareTip[] {
  return [...REPAIR_CARE_TIPS];
}
