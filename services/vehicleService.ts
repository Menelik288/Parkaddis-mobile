import apiClient from '../api/client';

export interface Vehicle {
  id: string;
  plateNumber: string;
  carModel: string;
  color: string;
  isPrimary: boolean;
}

export const vehicleService = {
  getUserVehicles: async () => {
    const response = await apiClient.get<Vehicle[]>('/vehicle');
    return response.data;
  },
};

export default vehicleService;
