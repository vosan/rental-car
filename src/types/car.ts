export interface Car {
  id: string;
  stockNumber: number;
  year: number;
  brand: string;
  model: string;
  type: string;
  img: string;
  description: string;
  fuelConsumption: number;
  engine: string;
  rentalPrice: number;
  rentalCompany: string;
  rentalConditions: string[];
  mileage: number;
  features: string[];
  location: {
    country: string;
    city: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CarFilters {
  brand?: string;
  price?: number;
  minMileage?: number;
  maxMileage?: number;
}

export interface CarsResponse {
  cars: Car[];
  totalCars: number;
  totalPages: number;
  page: number;
  perPage: number;
}

export interface FilterOptions {
  brands: string[];
  price: { min: number; max: number };
}

export interface BookingInput {
  name: string;
  email: string;
  comment?: string;
}

export interface BookingResponse {
  message: string;
}
