// Unit size configurations
const unitSizeConfig = {
  '5m²': { count: 40, basePrice: 49, sqm: 5 },
  '10m²': { count: 35, basePrice: 89, sqm: 10 },
  '15m²': { count: 25, basePrice: 129, sqm: 15 },
  '20m²': { count: 15, basePrice: 169, sqm: 20 },
  '30m²': { count: 10, basePrice: 239, sqm: 30 },
};

// Generate units
function generateUnits() {
  const units = [];
  let unitId = 1;

  for (const [size, config] of Object.entries(unitSizeConfig)) {
    for (let i = 0; i < config.count; i++) {
      const priceVariation = (Math.random() - 0.5) * 20;
      const isOccupied = Math.random() < getOccupancyRateForSize(size);

      units.push({
        id: `U${String(unitId).padStart(3, '0')}`,
        size,
        pricePerMonth: Math.round(config.basePrice + priceVariation),
        isOccupied,
        customerId: isOccupied ? `C${String(Math.floor(Math.random() * 80) + 1).padStart(3, '0')}` : null,
        rentedSince: isOccupied ? getRandomPastDate() : null,
      });
      unitId++;
    }
  }

  return units;
}

function getOccupancyRateForSize(size) {
  const rates = {
    '5m²': 0.92,
    '10m²': 0.88,
    '15m²': 0.82,
    '20m²': 0.75,
    '30m²': 0.65,
  };
  return rates[size];
}

function getRandomPastDate() {
  const months = Math.floor(Math.random() * 24) + 1;
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().split('T')[0];
}

// Generate customers
function generateCustomers() {
  const customers = [];

  for (let i = 1; i <= 85; i++) {
    const isActive = Math.random() < 0.88;
    const isBusiness = Math.random() < 0.35;
    const startDate = getRandomPastDate();

    customers.push({
      id: `C${String(i).padStart(3, '0')}`,
      name: isBusiness ? `Firma ${i}` : `Kunde ${i}`,
      type: isBusiness ? 'business' : 'private',
      startDate,
      endDate: isActive ? null : getRandomEndDate(startDate),
      unitIds: [`U${String(Math.floor(Math.random() * 125) + 1).padStart(3, '0')}`],
    });
  }

  return customers;
}

function getRandomEndDate(startDate) {
  const start = new Date(startDate);
  const months = Math.floor(Math.random() * 12) + 1;
  start.setMonth(start.getMonth() + months);
  return start.toISOString().split('T')[0];
}

// Export generated data
const units = generateUnits();
const customers = generateCustomers();

module.exports = { units, customers };
