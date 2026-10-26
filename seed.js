// Demo seed. Locations are approximate public info. BED COUNTS AND PHONE NUMBERS ARE SIMULATED PLACEHOLDERS.
// type: "gov" = government hospital, "pvt" = private (incl. trust-run). Beds are [free, total]. ago = minutes since last update.
const h = (id, slug, name, city, state, type, lat, lng, spec, gen, icu, ped, vent, ago) => ({
  id, slug, name, city, state, type, lat, lng, spec,
  phone: "+91110000" + String(id).padStart(4, "0"),
  beds: { gen, icu, ped, vent },
  updatedAt: Date.now() - ago * 60000,
  history: []
});
module.exports = [
  h(1, "aiims", "AIIMS New Delhi", "New Delhi", "Delhi", "gov", 28.5672, 77.2100, ["Trauma centre", "Cardiology", "Paediatrics"], [60,220], [9,60], [14,40], [5,24], 2),
  h(2, "safdarjung", "Safdarjung Hospital", "New Delhi", "Delhi", "gov", 28.5677, 77.2066, ["Emergency", "Burns unit"], [45,180], [4,40], [6,24], [2,16], 8),
  h(3, "rml", "Ram Manohar Lohia Hospital", "New Delhi", "Delhi", "gov", 28.6258, 77.2010, ["Emergency", "Cardiology"], [30,150], [6,30], [3,18], [3,12], 4),
  h(4, "loknayak", "Lok Nayak Hospital", "New Delhi", "Delhi", "gov", 28.6377, 77.2403, ["Emergency", "Trauma"], [70,260], [1,34], [9,30], [0,14], 36),
  h(5, "gangaram", "Sir Ganga Ram Hospital", "New Delhi", "Delhi", "pvt", 28.6387, 77.1895, ["Cardiology", "Intensivist"], [22,120], [5,26], [4,16], [2,10], 11),
  h(6, "maxsaket", "Max Super Speciality, Saket", "New Delhi", "Delhi", "pvt", 28.5275, 77.2117, ["Cardiology", "Neuro"], [18,100], [3,28], [5,16], [1,10], 6),
  h(7, "apollo", "Indraprastha Apollo", "New Delhi", "Delhi", "pvt", 28.5411, 77.2835, ["Cardiology", "Transplant"], [26,110], [7,30], [8,20], [4,12], 1),
  h(8, "ddu", "Deen Dayal Upadhyay Hospital", "New Delhi", "Delhi", "gov", 28.6281, 77.0914, ["Emergency", "Maternity"], [38,130], [0,16], [2,14], [0,6], 41),
  h(9, "fortis", "Fortis Escorts Heart Institute", "New Delhi", "Delhi", "pvt", 28.5605, 77.2740, ["Cardiology", "Cardiac surgery"], [14,80], [4,32], [2,10], [3,14], 5),
  h(10, "blkmax", "BLK-Max Super Speciality", "New Delhi", "Delhi", "pvt", 28.6436, 77.1778, ["Oncology", "Transplant"], [20,110], [6,34], [5,18], [2,12], 9),
  h(11, "medanta", "Medanta The Medicity", "Gurugram", "Haryana", "pvt", 28.4395, 77.0425, ["Cardiology", "Neuro"], [30,160], [8,48], [6,22], [4,18], 3),
  h(12, "jaypee", "Jaypee Hospital", "Noida", "Uttar Pradesh", "pvt", 28.5105, 77.3890, ["Emergency", "Ortho"], [24,120], [5,30], [4,16], [2,10], 14),
  h(13, "pgimer", "PGIMER", "Chandigarh", "Chandigarh", "gov", 30.7650, 76.7757, ["Trauma centre", "Neuro"], [80,300], [7,70], [12,46], [4,26], 7),
  h(14, "sms", "SMS Hospital", "Jaipur", "Rajasthan", "gov", 26.9059, 75.8197, ["Emergency", "Trauma"], [55,200], [5,44], [8,30], [3,18], 12),
  h(15, "kgmu", "King George's Medical University", "Lucknow", "Uttar Pradesh", "gov", 26.8690, 80.9140, ["Trauma centre", "Paediatrics"], [66,240], [6,52], [10,36], [2,20], 38),
  h(16, "kem", "KEM Hospital", "Mumbai", "Maharashtra", "gov", 19.0022, 72.8410, ["Emergency", "Burns"], [48,210], [3,46], [7,28], [1,16], 6),
  h(17, "lilavati", "Lilavati Hospital", "Mumbai", "Maharashtra", "pvt", 19.0509, 72.8294, ["Cardiology", "Neuro"], [16,90], [4,28], [3,12], [2,10], 2),
  h(18, "sskm", "SSKM Hospital", "Kolkata", "West Bengal", "gov", 22.5393, 88.3441, ["Trauma centre", "Neuro"], [72,260], [8,50], [9,32], [3,20], 10),
  h(19, "rggh", "Rajiv Gandhi Govt General Hospital", "Chennai", "Tamil Nadu", "gov", 13.0810, 80.2774, ["Emergency", "Trauma"], [64,230], [7,48], [11,34], [4,22], 5),
  h(20, "apollochennai", "Apollo Hospitals, Greams Road", "Chennai", "Tamil Nadu", "pvt", 13.0627, 80.2512, ["Cardiology", "Transplant"], [28,140], [9,40], [5,20], [5,16], 1),
  h(21, "victoria", "Victoria Hospital", "Bengaluru", "Karnataka", "gov", 12.9626, 77.5742, ["Emergency", "Burns"], [52,190], [4,38], [8,26], [2,14], 9),
  h(22, "manipal", "Manipal Hospital, Old Airport Road", "Bengaluru", "Karnataka", "pvt", 12.9585, 77.6481, ["Cardiology", "Oncology"], [20,110], [6,32], [4,16], [3,12], 4),
  h(23, "osmania", "Osmania General Hospital", "Hyderabad", "Telangana", "gov", 17.3724, 78.4741, ["Emergency", "Trauma"], [58,220], [2,40], [6,28], [1,16], 44),
  h(24, "civilahd", "Civil Hospital Ahmedabad", "Ahmedabad", "Gujarat", "gov", 23.0540, 72.6030, ["Trauma centre", "Emergency"], [60,250], [6,46], [9,32], [3,20], 13)
];
