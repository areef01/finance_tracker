// =====================================================
//  DATABASE — Upcoming Payments
//  Demo anchor: April 5, 2026
// =====================================================

const TODAY_DEMO  = new Date('2026-04-05');
const ALARM_DAYS  = 5; // highlight within this many days

const UPCOMING_PAYMENTS = [

  // ===== APRIL 2026 =====
  { id:'gym-apr26',     name:'Gym Membership',    icon:'🏋️', dueDate:'2026-04-01', amount:99.00,   category:'Subscription', person:'Sarah', status:'paid',    installment:false },
  { id:'unifi-apr26',   name:'Unifi Internet',    icon:'🌐', dueDate:'2026-04-05', amount:89.00,   category:'Bill',         person:'Alex',  status:'paid',    installment:false },
  { id:'car-apr26',     name:'Car Loan',          icon:'🚗', dueDate:'2026-04-05', amount:850.00,  category:'Installment',  person:'Alex',  status:'pending', installment:true,  monthsLeft:36 },
  { id:'home-apr26',    name:'Home Loan',         icon:'🏠', dueDate:'2026-04-10', amount:1200.00, category:'Installment',  person:'Alex',  status:'pending', installment:true,  monthsLeft:240 },
  { id:'mbb-apr26',     name:'Maybank CC',        icon:'💳', dueDate:'2026-04-12', amount:650.00,  category:'Credit Card',  person:'Sarah', status:'pending', installment:false },
  { id:'cimb-apr26',    name:'CIMB CC',           icon:'💳', dueDate:'2026-04-15', amount:420.00,  category:'Credit Card',  person:'Alex',  status:'paid',    installment:false },
  { id:'iphone-apr26',  name:'iPhone Install.',   icon:'📱', dueDate:'2026-04-18', amount:180.00,  category:'Installment',  person:'Sarah', status:'pending', installment:true,  monthsLeft:8  },
  { id:'laptop-apr26',  name:'Laptop Install.',   icon:'💻', dueDate:'2026-04-20', amount:120.00,  category:'Installment',  person:'Alex',  status:'pending', installment:true,  monthsLeft:4  },
  { id:'insure-apr26',  name:'Life Insurance',    icon:'🛡️', dueDate:'2026-04-22', amount:250.00,  category:'Insurance',    person:'Sarah', status:'pending', installment:false },
  { id:'takaful-apr26', name:'Takaful Premium',   icon:'🛡️', dueDate:'2026-04-24', amount:180.00,  category:'Insurance',    person:'Alex',  status:'pending', installment:false },
  { id:'astro-apr26',   name:'Astro Bill',        icon:'📺', dueDate:'2026-04-28', amount:149.00,  category:'Bill',         person:'Alex',  status:'pending', installment:false },

  // ===== MAY 2026 =====
  { id:'gym-may26',     name:'Gym Membership',    icon:'🏋️', dueDate:'2026-05-01', amount:99.00,   category:'Subscription', person:'Sarah', status:'pending', installment:false },
  { id:'unifi-may26',   name:'Unifi Internet',    icon:'🌐', dueDate:'2026-05-05', amount:89.00,   category:'Bill',         person:'Alex',  status:'pending', installment:false },
  { id:'car-may26',     name:'Car Loan',          icon:'🚗', dueDate:'2026-05-05', amount:850.00,  category:'Installment',  person:'Alex',  status:'pending', installment:true,  monthsLeft:35 },
  { id:'home-may26',    name:'Home Loan',         icon:'🏠', dueDate:'2026-05-10', amount:1200.00, category:'Installment',  person:'Alex',  status:'pending', installment:true,  monthsLeft:239 },
  { id:'mbb-may26',     name:'Maybank CC',        icon:'💳', dueDate:'2026-05-12', amount:580.00,  category:'Credit Card',  person:'Sarah', status:'pending', installment:false },
  { id:'cimb-may26',    name:'CIMB CC',           icon:'💳', dueDate:'2026-05-15', amount:390.00,  category:'Credit Card',  person:'Alex',  status:'pending', installment:false },
  { id:'iphone-may26',  name:'iPhone Install.',   icon:'📱', dueDate:'2026-05-18', amount:180.00,  category:'Installment',  person:'Sarah', status:'pending', installment:true,  monthsLeft:7  },
  { id:'laptop-may26',  name:'Laptop Install.',   icon:'💻', dueDate:'2026-05-20', amount:120.00,  category:'Installment',  person:'Alex',  status:'pending', installment:true,  monthsLeft:3  },
  { id:'insure-may26',  name:'Life Insurance',    icon:'🛡️', dueDate:'2026-05-22', amount:250.00,  category:'Insurance',    person:'Sarah', status:'pending', installment:false },
  { id:'takaful-may26', name:'Takaful Premium',   icon:'🛡️', dueDate:'2026-05-24', amount:180.00,  category:'Insurance',    person:'Alex',  status:'pending', installment:false },
  { id:'astro-may26',   name:'Astro Bill',        icon:'📺', dueDate:'2026-05-28', amount:149.00,  category:'Bill',         person:'Alex',  status:'pending', installment:false },

  // ===== JUNE 2026 =====
  { id:'gym-jun26',     name:'Gym Membership',    icon:'🏋️', dueDate:'2026-06-01', amount:99.00,   category:'Subscription', person:'Sarah', status:'pending', installment:false },
  { id:'unifi-jun26',   name:'Unifi Internet',    icon:'🌐', dueDate:'2026-06-05', amount:89.00,   category:'Bill',         person:'Alex',  status:'pending', installment:false },
  { id:'car-jun26',     name:'Car Loan',          icon:'🚗', dueDate:'2026-06-05', amount:850.00,  category:'Installment',  person:'Alex',  status:'pending', installment:true,  monthsLeft:34 },
  { id:'home-jun26',    name:'Home Loan',         icon:'🏠', dueDate:'2026-06-10', amount:1200.00, category:'Installment',  person:'Alex',  status:'pending', installment:true,  monthsLeft:238 },
  { id:'mbb-jun26',     name:'Maybank CC',        icon:'💳', dueDate:'2026-06-12', amount:720.00,  category:'Credit Card',  person:'Sarah', status:'pending', installment:false },
  { id:'cimb-jun26',    name:'CIMB CC',           icon:'💳', dueDate:'2026-06-15', amount:450.00,  category:'Credit Card',  person:'Alex',  status:'pending', installment:false },
  { id:'iphone-jun26',  name:'iPhone Install.',   icon:'📱', dueDate:'2026-06-18', amount:180.00,  category:'Installment',  person:'Sarah', status:'pending', installment:true,  monthsLeft:6  },
  { id:'insure-jun26',  name:'Life Insurance',    icon:'🛡️', dueDate:'2026-06-22', amount:250.00,  category:'Insurance',    person:'Sarah', status:'pending', installment:false },
  { id:'takaful-jun26', name:'Takaful Premium',   icon:'🛡️', dueDate:'2026-06-24', amount:180.00,  category:'Insurance',    person:'Alex',  status:'pending', installment:false },
  { id:'astro-jun26',   name:'Astro Bill',        icon:'📺', dueDate:'2026-06-28', amount:149.00,  category:'Bill',         person:'Alex',  status:'pending', installment:false },
];
