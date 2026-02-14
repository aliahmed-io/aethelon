export const WAREHOUSE_ADDRESS = {
    name: "Aethelon Warehouse",
    street1: process.env.WAREHOUSE_STREET1 || "123 Manufacturing Way",
    street2: process.env.WAREHOUSE_STREET2,
    city: process.env.WAREHOUSE_CITY || "San Francisco",
    state: process.env.WAREHOUSE_STATE || "CA",
    zip: process.env.WAREHOUSE_ZIP || "94105",
    country: process.env.WAREHOUSE_COUNTRY || "US",
    email: "logistics@aethelon.com",
    phone: "555-0123"
};

export const RETURNS_ADDRESS = {
    ...WAREHOUSE_ADDRESS,
    name: "Aethelon Returns",
    email: "returns@aethelon.com"
};
