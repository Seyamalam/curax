import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { doctors } from './schema';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

async function seedDoctors() {
  const existing = await db.select().from(doctors);
  if (existing.length > 0) {
    console.log('Doctors already seeded.');
    process.exit(0);
  }

  await db.insert(doctors).values([
    { name: 'Dr. Alice Smith', specialty: 'Cardiology', hospital: 'City Hospital', experience: 12, availability: 'Mon-Fri 9am-5pm', fees: 150,  bio: 'Dr. Alice Smith is a board-certified cardiologist with over a decade of experience treating complex heart conditions. She earned her MD from Harvard Medical School and completed her residency and fellowship at the Cleveland Clinic. Her clinical focus includes coronary artery disease, heart failure, and preventive cardiology. Dr. Smith is known for her compassionate approach, ensuring that every patient understands their condition and treatment options in full. She regularly speaks at national cardiology conferences and is involved in community outreach programs to promote heart health awareness.'
    },
    { name: 'Dr. Bob Johnson', specialty: 'Dermatology', hospital: 'SkinCare Clinic', experience: 8, availability: 'Tue-Thu 10am-4pm', fees: 120, bio: 'Specializes in skin disorders and cosmetic dermatology.' },
    { name: 'Dr. Carol Lee', specialty: 'Pediatrics', hospital: 'Children’s Hospital', experience: 10, availability: 'Mon-Fri 8am-3pm', fees: 100, bio: 'Loves working with children and families.' },
    { name: 'Dr. David Kim', specialty: 'Neurology', hospital: 'Neuro Center', experience: 15, availability: 'Mon, Wed, Fri 11am-6pm', fees: 200, bio: 'Focus on neurological disorders and research.' },
    { name: 'Dr. Emily Chen', specialty: 'Orthopedics', hospital: 'OrthoPlus', experience: 9, availability: 'Mon-Fri 9am-5pm', fees: 180, bio: 'Orthopedic surgeon with a passion for sports medicine.' },
    { name: 'Dr. Frank Wang', specialty: 'Urology', hospital: 'General Hospital', experience: 7, availability: 'Tue, Thu 10am-2pm', fees: 130, bio: 'Urology specialist with a patient-centered approach.' },
    { name: 'Dr. Grace Liu', specialty: 'Gynecology', hospital: 'Women’s Health Center', experience: 11, availability: 'Mon-Fri 10am-4pm', fees: 140, bio: 'Dedicated to women’s health and wellness.' },
    { name: 'Dr. Henry Patel', specialty: 'Endocrinology', hospital: 'EndoCare', experience: 13, availability: 'Mon, Wed, Fri 9am-1pm', fees: 160, bio: 'Expert in diabetes and hormonal disorders.' },
    { name: 'Dr. Isabella Garcia', specialty: 'Hematology', hospital: 'Blood Institute', experience: 10, availability: 'Mon-Fri 8am-2pm', fees: 170, bio: 'Researcher and clinician in blood diseases.' },
    { name: 'Dr. John Doe', specialty: 'General Practice', hospital: 'Family Clinic', experience: 6, availability: 'Mon-Fri 9am-5pm', fees: 90, bio: 'Your friendly neighborhood family doctor.' },
    { name: 'Dr. Jane Smith', specialty: 'Cardiology', hospital: 'City Hospital', experience: 14, availability: 'Mon, Thu 10am-6pm', fees: 155, bio: 'Senior cardiologist and educator.' },
    { name: 'Dr. Michael Brown', specialty: 'Dermatology', hospital: 'SkinCare Clinic', experience: 5, availability: 'Wed, Fri 12pm-5pm', fees: 110, bio: 'Focus on acne and skin cancer prevention.' },
    { name: 'Dr. Olivia Davis', specialty: 'Pediatrics', hospital: 'Children’s Hospital', experience: 8, availability: 'Mon-Fri 9am-3pm', fees: 105, bio: 'Pediatrician with a gentle touch.' },
    { name: 'Dr. Paul Miller', specialty: 'Neurology', hospital: 'Neuro Center', experience: 12, availability: 'Tue, Thu 10am-4pm', fees: 210, bio: 'Specialist in epilepsy and migraines.' },
    { name: 'Dr. Quinn Nguyen', specialty: 'Pediatrics', hospital: 'Family Clinic', experience: 7, availability: 'Mon, Wed, Fri 8am-2pm', fees: 95, bio: 'Caring for children of all ages.' },
    { name: 'Dr. Rachel Kim', specialty: 'Cardiology', hospital: 'City Hospital', experience: 9, availability: 'Mon-Fri 9am-5pm', fees: 145, bio: 'Cardiologist with a focus on preventive care.' },
    { name: 'Dr. Samuel Lee', specialty: 'Orthopedics', hospital: 'OrthoPlus', experience: 10, availability: 'Tue, Thu 11am-6pm', fees: 175, bio: 'Joint replacement and sports injury expert.' },
    { name: 'Dr. Tiffany Chen', specialty: 'Gynecology', hospital: 'Women’s Health Center', experience: 8, availability: 'Mon-Fri 10am-4pm', fees: 135, bio: 'Advocate for women’s reproductive health.' },
    { name: 'Dr. Uma Patel', specialty: 'Endocrinology', hospital: 'EndoCare', experience: 11, availability: 'Mon, Wed, Fri 9am-1pm', fees: 150, bio: 'Thyroid and metabolic disorder specialist.' },
    { name: 'Dr. Victor Wang', specialty: 'Hematology', hospital: 'Blood Institute', experience: 9, availability: 'Mon-Fri 8am-2pm', fees: 165, bio: 'Blood disorder researcher and clinician.' },
    { name: 'Dr. William Johnson', specialty: 'General Practice', hospital: 'Family Clinic', experience: 5, availability: 'Mon-Fri 9am-5pm', fees: 85, bio: 'General practitioner for all ages.' },
    { name: 'Dr. Xiao Li', specialty: 'Cardiology', hospital: 'City Hospital', experience: 10, availability: 'Mon, Wed, Fri 10am-4pm', fees: 140, bio: 'Cardiologist with international experience.' },
    { name: 'Dr. Yvonne Kim', specialty: 'Dermatology', hospital: 'SkinCare Clinic', experience: 6, availability: 'Tue, Thu 1pm-5pm', fees: 115, bio: 'Dermatologist focused on patient education.' },
    { name: 'Dr. Zara Patel', specialty: 'Pediatrics', hospital: 'Children’s Hospital', experience: 7, availability: 'Mon-Fri 8am-3pm', fees: 100, bio: 'Pediatrician with a love for teaching.' },
    { name: 'Dr. Aiden Chen', specialty: 'Orthopedics', hospital: 'OrthoPlus', experience: 8, availability: 'Mon-Fri 9am-5pm', fees: 170, bio: 'Orthopedic surgeon and sports medicine expert.' },
    { name: 'Dr. Benjamin Wang', specialty: 'Urology', hospital: 'General Hospital', experience: 6, availability: 'Tue, Thu 10am-2pm', fees: 125, bio: 'Urologist with a focus on minimally invasive procedures.' },
  ]);

  console.log('Seeded doctors table.');
  process.exit(0);
}

seedDoctors().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
}); 