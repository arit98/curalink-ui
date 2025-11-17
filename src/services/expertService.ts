import axios from 'axios';

const DOCTORS_API_URL = 'https://doctorsapi.com/api/doctors';
const DOCTORS_API_KEY = import.meta.env.VITE_DOCTORS_API_KEY;

export async function fetchExperts(): Promise<any[]> {
  try {
    const response = await axios.get(DOCTORS_API_URL, {
      headers: {
        'api-key': `${DOCTORS_API_KEY}`,
      },
    });
    
    // Extract doctors array from response
    const doctors = response.data.doctors || [];
    
    // Transform doctors to match ExpertCard format
    return doctors.map((doctor: any) => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialties?.[0] || 'General Practitioner',
      institution: doctor.address 
        ? `${doctor.address.city}, ${doctor.address.state}` 
        : 'Location not available',
      expertise: doctor.specialties || [],
      phone: doctor.phone,
      npi: doctor.npi,
      gender: doctor.gender,
      address: doctor.address,
      credentials: doctor.credentials || [],
      // For ExpertDetailsModal compatibility
      contact: {
        phone: doctor.phone,
        email: doctor.email || '', // API doesn't provide email, but keeping structure
      },
      education: doctor.credentials || [],
    }));
  } catch (error: any) {
    console.error('Error fetching experts from doctorsapi.com:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch experts');
  }
}
  
  