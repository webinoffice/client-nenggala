// src/lib/contacts.ts
export interface DojangContact {
  id: string;
  name: string;
  address: string;
  image: string;
  whatsapp: string; // E.164-ish: 6287852342342
  whatsappDisplay: string; // pretty: 0878-5234-2342
  picName: string;
}

export const DOJANG_CONTACTS: DojangContact[] = [
  {
    id: "kedoya",
    name: "Kedoya Sport Club",
    address:
      "Komplek Taman Kedoya Baru, Jl. Raya Kedoya Palma Blok FC No. 1, Kedoya Selatan, Kebon Jeruk, RT.18/RW.4, Kedoya Sel., Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11520",
    image: "/images/location-kedoya.jpg",
    whatsapp: "6287852342342",
    whatsappDisplay: "0878-5234-2342",
    picName: "Sabeum Reza",
  },
  {
    id: "tajur",
    name: "Tajur Trade Mall",
    address:
      "Jl. Raya Tajur No.112a, RT.02/RW.07, Muarasari, Kec. Bogor Sel., Kota Bogor, Jawa Barat 16137",
    image: "/images/location-tajur.jpg",
    whatsapp: "6287852342342",
    whatsappDisplay: "0878-5234-2342",
    picName: "Fiqah",
  },
  {
    id: "meruya",
    name: "Meruya Sport Club",
    address:
      "Jl. Meruya Utara No.46, RT.5/RW.8, Meruya Utara, Kec. Kembangan, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11630",
    image: "/images/location-meruya.jpg",
    whatsapp: "6287852342342",
    whatsappDisplay: "0878-5234-2342",
    picName: "Stephanny",
  },
];